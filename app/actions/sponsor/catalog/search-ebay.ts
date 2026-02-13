"use server";

import { searchEbayProducts } from "@/lib/ebay-api";

export async function searchEbay(query: string) {
  console.log("searchEbay action called with query:", query);

  try {
    console.log("Calling searchEbayProducts...");
    const products = await searchEbayProducts(query);
    console.log("Got products:", products.length);

    return { success: true, products };
  } catch (error: any) {
    console.error("searchEbay error:", error);
    return { success: false, products: [], error: error.message };
  }
}
