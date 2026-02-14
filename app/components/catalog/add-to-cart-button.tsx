"use client";

import { useState } from "react";
import { addToCart } from "@/app/actions/driver/cart-actions";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  catalogProductId: string;
  canAfford: boolean;
}

export default function AddToCartButton({ catalogProductId, canAfford }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(catalogProductId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={!canAfford || loading}
      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${
        canAfford && !loading
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
      }`}
    >
      {loading ? 'Adding...' : canAfford ? 'Add to Cart' : 'Insufficient Points'}
    </button>
  );
}