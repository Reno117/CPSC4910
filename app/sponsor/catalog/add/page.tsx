import { requireSponsorOrAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import EbaySearchForm from "@/app/components/catalog/ebay-search-form";

export default async function AddProductsPage() {
  const { isAdmin, sponsorId } = await requireSponsorOrAdmin();

  // If admin, fetch sponsors for dropdown
  const sponsors = isAdmin
    ? await prisma.sponsor.findMany({
        orderBy: { name: "asc" },
      })
    : undefined;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Products to Catalog</h1>
      <p className="text-gray-600 mb-8">
        Search eBay for products to add to your catalog. Your drivers will be
        able to redeem points for these items.
      </p>

      <EbaySearchForm
        isAdmin={isAdmin}
        sponsorId={sponsorId}
        sponsors={sponsors}
      />
    </div>
  );
}
