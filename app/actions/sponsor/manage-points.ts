"use server";

import { prisma } from "@/lib/prisma";
import { requireSponsorUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function addPoints(
  driverProfileId: string,
  amount: number,
  reason: string
) {
  const sponsorUser = await requireSponsorUser();
  const sponsorId = sponsorUser.sponsorUser!.sponsorId;

  // Verify driver belongs to this sponsor
  const driverProfile = await prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
  });

  if (!driverProfile || driverProfile.sponsorId !== sponsorId) {
    throw new Error("Driver not found or unauthorized");
  }

  // Update points in transaction
  await prisma.$transaction([
    // Update driver balance
    prisma.driverProfile.update({
      where: { id: driverProfileId },
      data: {
        pointsBalance: {
          increment: amount,
        },
      },
    }),
    
    // Create audit record
    prisma.pointChange.create({
      data: {
        driverProfileId: driverProfileId,
        sponsorId: sponsorId,
        amount: amount,
        reason: reason,
        changedBy: sponsorUser.id,
      },
    }),
  ]);

  revalidatePath(`/sponsor/drivers/${driverProfileId}`);
  
  return { success: true };
}