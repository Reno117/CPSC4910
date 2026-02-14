import { prisma } from "@/lib/prisma";
import { requireSponsorOrAdmin } from "@/lib/auth-helpers";
import Link from "next/link";
import CatalogActions from "@/app/components/catalog/catalog-actions";

export default async function CatalogPage() {
  const { isAdmin, sponsorId } = await requireSponsorOrAdmin();

  const products = await prisma.catalogProduct.findMany({
    where: isAdmin ? {} : { sponsorId: sponsorId! },
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
    <div className="p-8">
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
        <Link
          href="/sponsor/catalog/add"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Add Products
        </Link>
      </div>

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
          <p className="text-gray-600 mb-4">No products yet</p>
          <Link
            href="/sponsor/catalog/add"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white border rounded-lg shadow-sm overflow-hidden ${
                !product.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No image</div>
                )}
                {!product.isActive && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Inactive
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {isAdmin && (
                  <p className="text-xs text-blue-600 font-semibold mb-2">
                    {product.sponsor.name}
                  </p>
                )}

                <h3 className="font-semibold text-base mb-2 line-clamp-2">
                  {product.title}
                </h3>

                <h3 className="font-semibold text-base mb-2 line-clamp-2">
                  {product.price / 0.01} Points
                </h3>

                <p className="text-xs text-gray-400 mb-3">
                  eBay ID: {product.ebayItemId}
                </p>

                {/* Actions */}
                <CatalogActions
                  productId={product.id}
                  isActive={product.isActive}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
