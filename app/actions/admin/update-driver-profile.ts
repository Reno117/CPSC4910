"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const allowedStatuses = new Set(["pending", "active", "dropped"]);

export async function updateDriverProfile(formData: FormData) {
  await requireAdmin();

  const driverId = String(formData.get("driverId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const imageInput = String(formData.get("image") ?? "").trim();
  const sponsorIdInput = String(formData.get("sponsorId") ?? "").trim();
  const statusInput = String(formData.get("status") ?? "").trim().toLowerCase();

  if (!driverId || !name || !email) {
    redirect(`/admin/${driverId}?error=missing-required-fields`);
  }

  if (!allowedStatuses.has(statusInput)) {
    redirect(`/admin/${driverId}?error=invalid-status`);
  }

  const existingDriver = await prisma.driverProfile.findUnique({
    where: { id: driverId },
    select: { id: true, userId: true },
  });

  if (!existingDriver) {
    redirect(`/admin?error=driver-not-found`);
  }

  let sponsorId: string | null = null;
  if (sponsorIdInput) {
    const sponsorExists = await prisma.sponsor.findUnique({
      where: { id: sponsorIdInput },
      select: { id: true },
    });

    if (!sponsorExists) {
      redirect(`/admin/${driverId}?error=invalid-sponsor`);
    }

    sponsorId = sponsorIdInput;
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: existingDriver.userId },
      data: {
        name,
        email,
        image: imageInput || null,
      },
    });

    await tx.driverProfile.update({
      where: { id: driverId },
      data: {
        sponsorId,
        status: statusInput,
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/${driverId}`);
  redirect(`/admin/${driverId}?saved=1`);
}
