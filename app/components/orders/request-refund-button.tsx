"use client";

import { useState } from "react";
import { cancelOrder } from "@/app/actions/driver/order-actions";
import { useRouter } from "next/navigation";

interface CancelOrderButtonProps {
  orderId: string;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelOrder(orderId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to cancel order");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="bg-red-100 text-red-700 py-2 px-4 rounded-lg font-medium hover:bg-red-200 transition text-sm"
      >
        Cancel Order
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCancel}
        disabled={loading}
        className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition text-sm disabled:bg-gray-400"
      >
        {loading ? "Cancelling..." : "Confirm"}
      </button>
      <button
        onClick={() => setShowConfirm(false)}
        disabled={loading}
        className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition text-sm"
      >
        No
      </button>
    </div>
  );
}