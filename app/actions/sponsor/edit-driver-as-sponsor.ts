"use server";
import { prisma } from "@/lib/prisma";
import { requireSponsorOrAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function updateDriverProfile(
  driverProfileId: string,
  data: {
    name?: string;
    email?: string;
    image?: string;
    phoneNumber?: string;
    licenseNumber?: string;
    pointsBalance?: number;
  }
) {
  const { user, isAdmin, sponsorId } = await requireSponsorOrAdmin();

  const driverProfile = await prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
    include: { user: true },
  });

  if (!driverProfile) {
    throw new Error("Driver not found");
  }

  if (!isAdmin && driverProfile.sponsorId !== sponsorId) {
    throw new Error("Unauthorized: Driver not in your organization");
  }

  await prisma.$transaction(async (tx) => {
    if (data.name || data.email || data.image) {
      await tx.user.update({
        where: { id: driverProfile.userId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email }),
          ...(data.image && { image: data.image }),
        },
      });
    }

    await tx.driverProfile.update({
      where: { id: driverProfileId },
      data: {
        ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
        ...(data.licenseNumber !== undefined && { licenseNumber: data.licenseNumber }),
        ...(data.pointsBalance !== undefined && { pointsBalance: data.pointsBalance }),
      },
    });

    if (data.pointsBalance !== undefined && data.pointsBalance !== driverProfile.pointsBalance) {
      const pointDifference = data.pointsBalance - driverProfile.pointsBalance;
      await tx.pointChange.create({
        data: {
          driverProfileId: driverProfileId,
          sponsorId: driverProfile.sponsorId!,
          amount: pointDifference,
          reason: "Manual adjustment by " + (isAdmin ? "admin" : "sponsor"),
          changedBy: user.id,
        },
      });
    }
  });

  revalidatePath(`/sponsor/drivers`);
  revalidatePath(`/sponsor`);

  return { success: true };
}