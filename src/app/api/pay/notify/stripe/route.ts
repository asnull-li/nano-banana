import Stripe from "stripe";
import { updateOrder } from "@/services/order";
import { respOk } from "@/lib/resp";

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
