import { prisma } from "@/lib/prisma";
import { requireSponsorOrAdmin } from "@/lib/auth-helpers";
import Link from "next/link";
import CatalogActions from "@/app/components/catalog/catalog-actions";
import CatalogSearch from "@/app/components/catalog/search-catalog";
import ProductCard from "@/app/components/catalog/catalog-product-card";
import UpdatePointsModal from "@/app/components/catalog/edit-pointconversion-button";
import SponsorHeader from "@/app/components/SponsorComponents/SponsorHeader";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
})  {
  const { isAdmin, sponsorId } = await requireSponsorOrAdmin();
  let pointConversion = null;

if (sponsorId) {
  const sponsor = await prisma.sponsor.findUnique({
    where: { id: sponsorId },
    select: { pointValue: true },
  });
  pointConversion = sponsor?.pointValue ?? null;
}
  const { search } = await searchParams;
  const searchQuery = search || "";
  const products = await prisma.catalogProduct.findMany({
    where: {
    ...(isAdmin ? {} : { sponsorId: sponsorId! }),
    ...(searchQuery 
      ? {
        OR: [
          {  title: { contains: searchQuery}},
          { ebayItemId: {contains: searchQuery }},
          ],
        }
      : {}),
  },
    include: {
      sponsor: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;


  return (
    <div>
      <SponsorHeader />
      <div className="p-8 pt-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? "All Product Catalogs" : "Product Catalog"}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage products that drivers can redeem with points
          </p>
        </div>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <UpdatePointsModal itemId={sponsorId} pointConversion={pointConversion} />
        <Link
          href="/sponsor/catalog/add"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Add Products
        </Link>
        </div>
      </div>
      <CatalogSearch initialSearch={searchQuery} />
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-blue-600">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-yellow-600">{inactiveCount}</p>
        </div>
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            {searchQuery ? "No products found matching your search": "No products yet"}
             </p>
            {!searchQuery && (
          <Link
            href="/sponsor/catalog/add"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Your First Product
          </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isAdmin={isAdmin} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
