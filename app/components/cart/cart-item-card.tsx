"use client";

import { useState } from "react";
import { updateCartItemQuantity, removeFromCart } from "@/app/actions/driver/cart-actions";
import { useRouter } from "next/navigation";

interface CartItemCardProps {
  item: {
    id: string;
    ebayItemId: string;
    title: string;
    imageUrl: string | null;
    pointPrice: number;
    quantity: number;
  };
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setQuantity(newQuantity);
    setLoading(true);
    
    try {
      await updateCartItemQuantity(item.id, newQuantity);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to update quantity");
      setQuantity(item.quantity);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeFromCart(item.id);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to remove item");
      setLoading(false);
    }
  };

  const subtotal = item.pointPrice * quantity;

  return (
    <div className="bg-white border rounded-lg p-4 flex gap-4">
      {/* Image */}
      <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-gray-400 text-xs">No image</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1">
        <h3 className="font-semibold text-base mb-2">{item.title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          {item.pointPrice.toLocaleString()} points each
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={loading || quantity <= 1}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >
              −
            </button>
            <span className="px-4 py-1 border-x">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={loading}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={loading}
            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <p className="text-xl font-bold text-green-600">
          {subtotal.toLocaleString()} pts
        </p>
      </div>
    </div>
  );
}