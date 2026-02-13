"use server";

import { prisma } from "@/lib/prisma";
import { requireSponsorOrAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function toggleProductActive(
  catalogProductId: string,
  isActive: boolean
) {
  const { isAdmin, sponsorId } = await requireSponsorOrAdmin();

  const product = await prisma.catalogProduct.findUnique({
    where: { id: catalogProductId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (!isAdmin && product.sponsorId !== sponsorId) {
    throw new Error("Unauthorized");
  }

  await prisma.catalogProduct.update({
    where: { id: catalogProductId },
    data: { isActive },
  });

  revalidatePath("/sponsor/catalog");
  
  return { success: true };
}