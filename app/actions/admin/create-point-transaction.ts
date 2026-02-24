"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAdminPointTransaction(formData: FormData) {
  const adminUser = await requireAdmin();

  const driverId = String(formData.get("driverId") ?? "").trim();
  const amountInput = String(formData.get("amount") ?? "").trim();
  const reasonInput = String(formData.get("reason") ?? "").trim();

  if (!driverId) {
    redirect("/admin?error=missing-driver-id");
  }

  const amount = Number.parseInt(amountInput, 10);
  if (Number.isNaN(amount) || amount === 0) {
    redirect(`/admin/${driverId}/transactions?error=invalid-amount`);
  }

  if (!reasonInput) {
    redirect(`/admin/${driverId}/transactions?error=missing-reason`);
  }

  const driver = await prisma.driverProfile.findUnique({
    where: { id: driverId },
    select: {
      id: true,
      sponsorId: true,
    },
  });

  if (!driver) {
    redirect(`/admin?error=driver-not-found`);
  }

  if (!driver.sponsorId) {
    redirect(`/admin/${driverId}/transactions?error=driver-has-no-sponsor`);
  }

  await prisma.$transaction([
    prisma.driverProfile.update({
      where: { id: driverId },
      data: {
        pointsBalance: {
          increment: amount,
        },
      },
    }),
    prisma.pointChange.create({
      data: {
        driverProfileId: driverId,
        sponsorId: driver.sponsorId,
        amount,
        reason: `Admin adjustment: ${reasonInput}`,
        changedBy: adminUser.id,
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath(`/admin/${driverId}`);
  revalidatePath(`/admin/${driverId}/transactions`);
  redirect(`/admin/${driverId}/transactions?saved=1`);
}
