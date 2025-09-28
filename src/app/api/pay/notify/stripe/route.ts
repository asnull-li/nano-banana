import Stripe from "stripe";
import { updateOrder } from "@/services/order";
import { respOk } from "@/lib/resp";
import { updateOrderSubscription, findOrderByOrderNo } from "@/models/order";
import { increaseCredits, CreditsTransType } from "@/services/credit";
import { getIsoTimestr } from "@/lib/time";

interface StripeInvoice extends Stripe.Invoice {
  parent?: {
    subscription_details?: {
      subscription?: string;
      metadata?: Record<string, string>;
    };
  };
}

export async function POST(req: Request) {
  try {
    const stripePrivateKey = process.env.STRIPE_PRIVATE_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripePrivateKey || !stripeWebhookSecret) {
      throw new Error("invalid stripe config");
    }

    const stripe = new Stripe(stripePrivateKey);

    const sign = req.headers.get("stripe-signature") as string;
    const body = await req.text();
    if (!sign || !body) {
      throw new Error("invalid notify data");
    }

    const event = await stripe.webhooks.constructEventAsync(
      body,
      sign,
      stripeWebhookSecret
    );

    console.log("stripe notify event: ", JSON.stringify(event));

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (
          !session ||
          !session.metadata ||
          !session.metadata.order_no ||
          session.payment_status !== "paid"
        ) {
          throw new Error("invalid session");
        }

        const order_no = session.metadata.order_no;
        const paid_email =
          session.customer_details?.email || session.customer_email || "";
        const paid_detail = JSON.stringify(session);

        await updateOrder({ order_no, paid_email, paid_detail });
        break;
      }

      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as StripeInvoice;

        const subscriptionId =
          invoice.subscription ||
          invoice.parent?.subscription_details?.subscription;

        if (!invoice || !subscriptionId) {
          console.log(`${event.type}: not a subscription invoice, skipping`);
          break;
        }

        await handleSubscriptionRenewal(invoice, stripe);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as StripeInvoice;

        const subscriptionId =
          invoice.subscription ||
          invoice.parent?.subscription_details?.subscription;

        if (!invoice || !subscriptionId) {
          console.log(
            "invoice.payment_failed: not a subscription invoice, skipping"
          );
          break;
        }

        await handleSubscriptionPaymentFailed(invoice);
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      default:
        console.log("not handle event: ", event.type);
    }

    return respOk();
  } catch (e: any) {
    console.log("stripe notify failed: ", e);
    return Response.json(
      { error: `handle stripe notify failed: ${e.message}` },
      { status: 500 }
    );
  }
}

async function handleSubscriptionRenewal(
  invoice: StripeInvoice,
  stripe: Stripe
) {
  try {
    console.log(
      "Processing subscription invoice:",
      invoice.id,
      "billing_reason:",
      invoice.billing_reason
    );

    if (invoice.billing_reason === "subscription_create") {
      console.log(
        "Skipping first invoice (subscription_create) as it's handled by checkout.session.completed"
      );
      return;
    }

    if (invoice.billing_reason !== "subscription_cycle") {
      console.log(
        `Skipping invoice with billing_reason: ${invoice.billing_reason} (not a regular renewal)`
      );
      return;
    }

    console.log("✅ This is a subscription renewal (subscription_cycle)");

    const subscriptionId =
      invoice.subscription ||
      invoice.parent?.subscription_details?.subscription;
    if (!subscriptionId) {
      throw new Error("subscription ID not found in invoice");
    }

    const subscription = await stripe.subscriptions.retrieve(
      subscriptionId as string
    );
    if (!subscription) {
      throw new Error("subscription not found");
    }

    const { order_no, user_uuid, credits, user_email } =
      extractMetadataFromSources(subscription, invoice);

    if (!order_no || !user_uuid || !credits) {
      console.log("Missing required metadata:", {
        order_no,
        user_uuid,
        credits,
      });
      return;
    }

    const creditsAmount = parseInt(credits);
    if (isNaN(creditsAmount) || creditsAmount <= 0) {
      console.log("Invalid credits amount:", credits);
      return;
    }

    const order = await findOrderByOrderNo(order_no);
    if (!order) {
      console.log("Original order not found:", order_no);
      return;
    }

    const renewalDate = new Date(invoice.period_end * 1000);
    const creditsExpiry = new Date(renewalDate);
    creditsExpiry.setMonth(creditsExpiry.getMonth() + 1);

    await increaseCredits({
      user_uuid: user_uuid,
      trans_type: CreditsTransType.OrderPay,
      credits: creditsAmount,
      expired_at: creditsExpiry.toISOString(),
      order_no: order_no,
    });

    const paid_at = getIsoTimestr();
    const paid_email = invoice.customer_email || user_email || "";
    const paid_detail = JSON.stringify(invoice);

    const invoiceCount = await getInvoiceCountForSubscription(
      subscription.id,
      stripe
    );

    await updateOrderSubscription(
      order_no,
      subscription.id,
      subscription.items.data[0]?.quantity || 1,
      subscription.current_period_start,
      subscription.current_period_end,
      subscription.current_period_start,
      "paid",
      paid_at,
      invoiceCount,
      paid_email,
      paid_detail
    );

    console.log(
      `Subscription renewal processed successfully for user ${user_uuid}, added ${creditsAmount} credits, expiry: ${creditsExpiry.toISOString()}`
    );
  } catch (error) {
    console.error("Failed to handle subscription renewal:", error);
    throw error;
  }
}

async function handleSubscriptionPaymentFailed(invoice: StripeInvoice) {
  try {
    console.log(
      "Processing subscription payment failure for invoice:",
      invoice.id
    );

    const subscription_id =
      invoice.subscription ||
      invoice.parent?.subscription_details?.subscription;
    const customer_email = invoice.customer_email || "";
    const attempt_count = invoice.attempt_count || 1;
    const next_payment_attempt = invoice.next_payment_attempt;

    console.log(
      `Subscription payment failed: ${subscription_id}, customer: ${customer_email}, attempt: ${attempt_count}`
    );

    if (next_payment_attempt) {
      const nextAttemptDate = new Date(next_payment_attempt * 1000);
      console.log(
        `Next payment attempt scheduled for: ${nextAttemptDate.toISOString()}`
      );
    } else {
      console.log(
        "No more payment attempts scheduled - subscription may be at risk"
      );

      const invoiceMetadata = invoice.lines?.data?.[0]?.metadata || {};
      const { user_uuid, order_no } = invoiceMetadata;

      if (user_uuid && order_no) {
        console.log(
          `Critical: Payment failure for user ${user_uuid}, order ${order_no} - manual intervention may be required`
        );
      }
    }
  } catch (error) {
    console.error("Failed to handle subscription payment failure:", error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log("Processing subscription creation:", subscription.id);

    const { order_no, user_uuid, product_name } =
      extractMetadataFromSources(subscription);

    if (order_no && user_uuid) {
      console.log(
        `Subscription ${
          subscription.id
        } created for user ${user_uuid}, order ${order_no}, product: ${
          product_name || "unknown"
        }`
      );
      console.log(
        `Subscription status: ${
          subscription.status
        }, current period: ${new Date(
          subscription.current_period_start * 1000
        ).toISOString()} - ${new Date(
          subscription.current_period_end * 1000
        ).toISOString()}`
      );
    } else {
      console.warn(
        `Subscription ${subscription.id} created but missing critical metadata:`,
        { order_no, user_uuid }
      );
    }
  } catch (error) {
    console.error("Failed to handle subscription creation:", error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log("Processing subscription update:", subscription.id);

    const { order_no, user_uuid, product_name } =
      extractMetadataFromSources(subscription);

    if (subscription.cancel_at_period_end) {
      const cancelDate = new Date(subscription.current_period_end * 1000);
      console.log(
        `Subscription ${
          subscription.id
        } scheduled for cancellation on ${cancelDate.toISOString()}`
      );

      if (user_uuid && order_no) {
        console.log(
          `User ${user_uuid} will lose access after current period ends (order: ${order_no})`
        );
      }
    }

    const previousAttributes = (subscription as any).previous_attributes || {};
    if (
      previousAttributes.cancel_at_period_end === true &&
      !subscription.cancel_at_period_end
    ) {
      console.log(
        `Subscription ${subscription.id} reactivated - cancellation removed`
      );
    }

    if (order_no && user_uuid) {
      console.log(
        `Subscription ${subscription.id} updated for user ${user_uuid}, order ${order_no}, status: ${subscription.status}`
      );
    }
  } catch (error) {
    console.error("Failed to handle subscription update:", error);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  try {
    console.log("Processing subscription cancellation:", subscription.id);

    const { order_no, user_uuid, product_name } =
      extractMetadataFromSources(subscription);
    const canceledAt = subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : new Date();

    if (order_no && user_uuid) {
      console.log(
        `Subscription ${
          subscription.id
        } canceled for user ${user_uuid}, order ${order_no}, product: ${
          product_name || "unknown"
        }`
      );
      console.log(
        `Cancellation date: ${canceledAt.toISOString()}, reason: ${
          subscription.cancellation_details?.reason || "unknown"
        }`
      );

      console.log(
        `User ${user_uuid} has lost subscription access - consider sending notification email`
      );
    } else {
      console.warn(
        `Subscription ${subscription.id} canceled but missing critical metadata:`,
        { order_no, user_uuid }
      );
    }
  } catch (error) {
    console.error("Failed to handle subscription cancellation:", error);
  }
}

async function getInvoiceCountForSubscription(
  subscriptionId: string,
  stripe: Stripe
): Promise<number> {
  try {
    const invoices = await stripe.invoices.list({
      subscription: subscriptionId,
      status: "paid",
      limit: 100,
    });
    return invoices.data.length;
  } catch (error) {
    console.error("Failed to get invoice count:", error);
    return 1;
  }
}

function extractMetadataFromSources(
  subscription: Stripe.Subscription,
  invoice?: StripeInvoice
): {
  order_no?: string;
  user_uuid?: string;
  credits?: string;
  user_email?: string;
  product_name?: string;
} {
  let metadata: any = {};

  if (subscription?.metadata) {
    metadata = { ...subscription.metadata };
  }

  if (invoice?.metadata) {
    metadata = { ...metadata, ...invoice.metadata };
  }

  // Get metadata from invoice lines if available
  if (invoice?.lines?.data?.[0]?.metadata) {
    metadata = { ...metadata, ...invoice.lines.data[0].metadata };
  }

  return {
    order_no: metadata.order_no,
    user_uuid: metadata.user_uuid,
    credits: metadata.credits,
    user_email: metadata.user_email || invoice?.customer_email,
    product_name: metadata.product_name,
  };
}
