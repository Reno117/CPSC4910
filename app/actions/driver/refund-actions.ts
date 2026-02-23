"use server";

import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function requestRefund(orderId: string, reason: string) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "driver") {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.driverProfileId !== user.driverProfile?.id) {
    throw new Error("Not your order");
  }

  if (order.status !== "delivered") {
    throw new Error("Can only request refund for delivered orders");
  }

  await prisma.refundRequest.create({
    data: {
      orderId,
      reason,
      status: "pending",
    },
  });
  
  return { success: true };
}