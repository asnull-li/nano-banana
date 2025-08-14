import { updateCreditForOrder } from "./credit";
import {
  findOrderByOrderNo,
  OrderStatus,
  updateOrderStatus,
} from "@/models/order";
import { getIsoTimestr } from "@/lib/time";

import { updateAffiliateForOrder } from "./affiliate";
import { Order } from "@/types/order";

export async function updateOrder({
  order_no,
  paid_email,
  paid_detail,
}: {
  order_no: string;
  paid_email: string;
  paid_detail: string;
}) {
  try {
    if (!order_no || !paid_email || !paid_email) {
      throw new Error("invalid params");
    }

    // query order
    const order = await findOrderByOrderNo(order_no);
    if (!order) {
      throw new Error("invalid order");
    }

    // order paid
    if (order.status === OrderStatus.Paid) {
      return;
    }

    // only update order status from created to paid
    if (order.status !== OrderStatus.Created) {
      throw new Error("invalid order status");
    }

    const paid_at = getIsoTimestr();
    await updateOrderStatus(
      order_no,
      OrderStatus.Paid,
      paid_at,
      paid_email,
      paid_detail
    );

    if (order.user_uuid) {
      if (order.credits > 0) {
        // increase credits for paied order
        await updateCreditForOrder(order as unknown as Order);
      }

      // update affiliate for paied order
      await updateAffiliateForOrder(order as unknown as Order);
    }
  } catch (e) {
    console.log("update order failed: ", e);
    throw e;
  }
}
