"use server";

import { prisma } from "@/lib/prisma";
import { requireSponsorOrAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function addPoints(
  driverProfileId: string,
  amount: number,
  reason: string,
  sponsorIdParam?: string
) {
  const { user, isAdmin, sponsorId } = await requireSponsorOrAdmin();

  // Verify driver belongs to this sponsor (unless admin)
  const driverProfile = await prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
  });
console.log("sponsorIdParam:", sponsorIdParam);
console.log("sponsorId from auth:", sponsorId);
  if (!driverProfile) {
    throw new Error("Driver not found");
  }
  // Use the driver's actual sponsorId for the point change record
  const actualSponsorId = sponsorIdParam ?? sponsorId;
  
  if (!actualSponsorId) {
    throw new Error("Driver is not associated with a sponsor");
  };

   // Verify the driver is actually sponsored by this sponsor via bridge table
  if (!isAdmin) {
    const sponsorship = await prisma.sponsoredBy.findUnique({
      where: {
        driverId_sponsorOrgId: {
          driverId: driverProfileId,
          sponsorOrgId: actualSponsorId,
        },
      },
    });
    if (!sponsorship) {
      throw new Error("Unauthorized: Driver not in your organization");
    }
  }

  // Update points in transaction
  await prisma.$transaction([
    prisma.sponsoredBy.update({
      where: { 
        driverId_sponsorOrgId: {
          driverId: driverProfileId,
          sponsorOrgId: actualSponsorId, 
        },
      },
      data: {
        points: {
          increment: amount,
        },
      },
    }),
    
    prisma.pointChange.create({
      data: {
        driverProfileId: driverProfileId,
        sponsorId: actualSponsorId,
        amount: amount,
        reason: reason,
        changedBy: user.id,
      },
    }),
  ]);

  revalidatePath(`/sponsor/drivers`);
  
  return { success: true };
}