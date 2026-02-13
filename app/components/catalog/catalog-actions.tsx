"use client";

import { useState } from "react";
import { removeProductFromCatalog } from "@/app/actions/sponsor/catalog/remove-product";
import { toggleProductActive } from "@/app/actions/sponsor/catalog/toggle-product";
import { useRouter } from "next/navigation";

interface CatalogActionsProps {
  productId: string;
  isActive: boolean;
}

export default function CatalogActions({ productId, isActive }: CatalogActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleProductActive(productId, !isActive);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to toggle product");
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeProductFromCatalog(productId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to remove product");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Toggle */}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`w-full px-4 py-2 rounded text-sm font-medium transition ${
          isActive
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        } disabled:opacity-50`}
      >
        {loading ? 'Updating...' : isActive ? 'Deactivate' : 'Activate'}
      </button>

      {/* Remove */}
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full bg-red-100 text-red-700 px-4 py-2 rounded text-sm font-medium hover:bg-red-200"
        >
          Remove
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-center text-gray-600">Remove this product?</p>
          <div className="flex gap-2">
            <button
              onClick={handleRemove}
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Removing...' : 'Yes'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}