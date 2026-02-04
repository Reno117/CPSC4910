"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function createSponsorUser(sponsorId: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Not authenticated");
  }

  const sponsor = await prisma.sponsor.findUnique({
    where: { id: sponsorId },
  });

  if (!sponsor) {
    throw new Error("Sponsor not found");
  }

  return prisma.sponsorUser.create({
    data: {
      userId: user.id,
      sponsorId: sponsor.id,
    },
  });
}
