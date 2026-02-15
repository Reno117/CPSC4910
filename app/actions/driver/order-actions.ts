"use server";

import { prisma } from "@/lib/prisma";
import { requireDriver } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function cancelOrder(orderId: string) {
  const user = await requireDriver();
  const driverProfile = user.driverProfile!;

  // Get the order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Verify ownership
  if (order.driverProfileId !== driverProfile.id) {
    throw new Error("Unauthorized");
  }

  // Can only cancel pending orders
  if (order.status !== "pending") {
    throw new Error("Only pending orders can be cancelled");
  }

  // Use transaction for refund
  await prisma.$transaction(async (tx) => {
    // 1. Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });

    // 2. Refund points to driver
    await tx.driverProfile.update({
      where: { id: driverProfile.id },
      data: {
        pointsBalance: {
          increment: order.totalPoints,
        },
      },
    });

    // 3. Create point change record (positive for refund)
    await tx.pointChange.create({
      data: {
        driverProfileId: driverProfile.id,
        sponsorId: order.sponsorId,
        amount: order.totalPoints,
        reason: `Order #${order.id.slice(-8)} - Cancelled (Refund)`,
        changedBy: user.id,
      },
    });
  });

  revalidatePath("/driver/orders");
  revalidatePath(`/driver/orders/${orderId}`);

  return { success: true };
}