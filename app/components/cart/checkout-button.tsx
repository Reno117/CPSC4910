"use client";

import { useState } from "react";
import { checkout } from "@/app/actions/driver/checkout-actions";
import { useRouter } from "next/navigation";

interface CheckoutButtonProps {
  canCheckout: boolean;
  totalPoints: number;
  pointsNeeded: number;
}

export default function CheckoutButton({ canCheckout, totalPoints, pointsNeeded }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const result = await checkout();
      
      if (result.success) {
        // Redirect to order confirmation
        router.push(`/driver/orders/${result.orderId}`);
      }
    } catch (error: any) {
      alert(error.message || "Checkout failed");
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        disabled={!canCheckout}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          canCheckout
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {canCheckout ? 'Proceed to Checkout' : 'Insufficient Points'}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <p className="text-sm text-yellow-800 font-medium mb-1">Confirm Purchase</p>
        <p className="text-xs text-yellow-700">
          You will spend {totalPoints.toLocaleString()} points
        </p>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Processing...' : 'Confirm Order'}
      </button>

      <button
        onClick={() => setShowConfirm(false)}
        disabled={loading}
        className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
      >
        Cancel
      </button>
    </div>
  );
}