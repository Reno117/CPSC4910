"use server";

import { prisma } from "@/lib/prisma";
import { requireDriver } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

interface DeliveryInformation {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export async function checkout(deliveryInformation: DeliveryInformation) {
  const requiredValues = [
    deliveryInformation?.firstName,
    deliveryInformation?.lastName,
    deliveryInformation?.phoneNumber,
    deliveryInformation?.address,
    deliveryInformation?.city,
    deliveryInformation?.state,
    deliveryInformation?.zipCode,
  ];

  if (requiredValues.some((value) => !value || !value.trim())) {
    throw new Error("All delivery information fields are required");
  }

  const user = await requireDriver();
  const driverProfile = user.driverProfile!;

  // Get cart with items
  const cart = await prisma.cart.findUnique({
    where: { driverProfileId: driverProfile.id },
    include: {
      items: true,
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Calculate total
  const totalPoints = cart.items.reduce(
    (sum, item) => sum + item.pointPrice * item.quantity,
    0
  );

  // Verify sufficient points
  if (driverProfile.pointsBalance < totalPoints) {
    throw new Error(
      `Insufficient points. You need ${totalPoints - driverProfile.pointsBalance} more points.`
    );
  }

  // Verify driver has a sponsor
  if (!driverProfile.sponsorId) {
    throw new Error("You must be affiliated with a sponsor to place orders");
  }

  // Use transaction to ensure atomicity
  const order = await prisma.$transaction(async (tx) => {
    // 1. Create order
    const newOrder = await tx.order.create({
      data: {
        driverProfileId: driverProfile.id,
        sponsorId: driverProfile.sponsorId!,
        totalPoints: totalPoints,
        status: "pending",
      },
    });

    // 2. Create order items
    await tx.orderItem.createMany({
      data: cart.items.map((item) => ({
        orderId: newOrder.id,
        ebayItemId: item.ebayItemId,
        title: item.title,
        imageUrl: item.imageUrl,
        pointPrice: item.pointPrice,
        quantity: item.quantity,
      })),
    });

    // 3. Deduct points from driver
    await tx.driverProfile.update({
      where: { id: driverProfile.id },
      data: {
        pointsBalance: {
          decrement: totalPoints,
        },
      },
    });

    // 4. Create point change record (negative for purchase)
    await tx.pointChange.create({
      data: {
        driverProfileId: driverProfile.id,
        sponsorId: driverProfile.sponsorId!,
        amount: -totalPoints,
        reason: `Order #${newOrder.id.slice(-8)} - Purchase`,
        changedBy: user.id, // Driver made the purchase
      },
    });

    // 5. Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return newOrder;
  });

  revalidatePath("/driver/cart");
  revalidatePath("/driver/orders");
  revalidatePath("/driver");

  return { success: true, orderId: order.id };
}