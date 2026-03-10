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

  const driverProfile = await prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
  });

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
    const sponsorship = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM sponsored_by
      WHERE driverId = ${driverProfileId}
        AND sponsorOrgId = ${actualSponsorId}
      LIMIT 1
    `;

    if (sponsorship.length === 0) {
      throw new Error("Unauthorized: Driver not in your organization");
    }
  }

  // Update points in transaction
  await prisma.$transaction(async (tx) => {
    const updatedRows = await tx.$executeRaw`
      UPDATE sponsored_by
      SET points = points + ${amount}
      WHERE driverId = ${driverProfileId}
        AND sponsorOrgId = ${actualSponsorId}
    `;

    if (updatedRows === 0) {
      throw new Error("Sponsorship not found for this driver and sponsor");
    }

    await tx.pointChange.create({
      data: {
        driverProfileId: driverProfileId,
        sponsorId: actualSponsorId,
        amount: amount,
        reason: reason,
        changedBy: user.id,
      },
    });
  });

  revalidatePath(`/sponsor/drivers`);
  
  return { success: true };
}