"use server";

import { prisma } from "@/lib/prisma";
import { requireSponsorOrAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function removeProductFromCatalog(catalogProductId: string) {
  const { isAdmin, sponsorId } = await requireSponsorOrAdmin();

  // Get the product
  const product = await prisma.catalogProduct.findUnique({
    where: { id: catalogProductId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Security: Sponsors can only remove their own products
  if (!isAdmin && product.sponsorId !== sponsorId) {
    throw new Error("Unauthorized");
  }

  await prisma.catalogProduct.delete({
    where: { id: catalogProductId },
  });

  revalidatePath("/sponsor/catalog");
  
  return { success: true };
}