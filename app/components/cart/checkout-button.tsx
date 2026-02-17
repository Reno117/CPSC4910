"use client";

import { useState } from "react";
import { checkout } from "@/app/actions/driver/checkout-actions";
import { useRouter } from "next/navigation";

interface CheckoutButtonProps {
  canCheckout: boolean;
  totalPoints: number;
  pointsNeeded: number;
}

interface DeliveryInformation {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function CheckoutButton({ canCheckout, totalPoints, pointsNeeded }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deliveryInformation, setDeliveryInformation] = useState<DeliveryInformation>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const router = useRouter();

  const isDeliveryInformationComplete = Object.values(deliveryInformation).every(
    (value) => value.trim().length > 0,
  );

  const handleCheckout = async () => {
    if (!isDeliveryInformationComplete) {
      alert("Please fill out all delivery information fields");
      return;
    }

    setLoading(true);
    try {
      const result = await checkout(deliveryInformation);
      
      if (result.success && result.orderId) {
        const orderPath = `/driver/orders/${result.orderId}`;
        router.push(orderPath);
        router.refresh();
        window.location.href = orderPath;
        return;
      }

      throw new Error("Checkout succeeded but order could not be opened");
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

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Delivery Information</p>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="First Name"
            value={deliveryInformation.firstName}
            onChange={(e) =>
              setDeliveryInformation((prev) => ({ ...prev, firstName: e.target.value }))
            }
            disabled={loading}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={deliveryInformation.lastName}
            onChange={(e) =>
              setDeliveryInformation((prev) => ({ ...prev, lastName: e.target.value }))
            }
            disabled={loading}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <input
          type="text"
          placeholder="Phone Number"
          value={deliveryInformation.phoneNumber}
          onChange={(e) =>
            setDeliveryInformation((prev) => ({ ...prev, phoneNumber: e.target.value }))
          }
          disabled={loading}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Address"
          value={deliveryInformation.address}
          onChange={(e) =>
            setDeliveryInformation((prev) => ({ ...prev, address: e.target.value }))
          }
          disabled={loading}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="City"
            value={deliveryInformation.city}
            onChange={(e) =>
              setDeliveryInformation((prev) => ({ ...prev, city: e.target.value }))
            }
            disabled={loading}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="State"
            value={deliveryInformation.state}
            onChange={(e) =>
              setDeliveryInformation((prev) => ({ ...prev, state: e.target.value }))
            }
            disabled={loading}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={deliveryInformation.zipCode}
            onChange={(e) =>
              setDeliveryInformation((prev) => ({ ...prev, zipCode: e.target.value }))
            }
            disabled={loading}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || !isDeliveryInformationComplete}
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