import { requireDriver } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface OrderPageProps {
  params: Promise<{  // Change this to Promise
    id: string;
  }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;  // Await params here
  
  const user = await requireDriver();
  const driverProfile = user.driverProfile!;

  const order = await prisma.order.findUnique({
    where: { id },  // Use the awaited id
    include: {
      items: true,
      sponsor: true,
    },
  });

  if (!order || order.driverProfileId !== driverProfile.id) {
    notFound();
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    processing: "bg-blue-100 text-blue-800 border-blue-300",
    shipped: "bg-purple-100 text-purple-800 border-purple-300",
    delivered: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  const statusColor = statusColors[order.status as keyof typeof statusColors] || statusColors.pending;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Success Banner */}
      {order.status === "pending" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h2 className="text-xl font-bold text-green-900">Order Placed Successfully!</h2>
              <p className="text-green-700 text-sm">Your order has been submitted and is being processed.</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Header */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Order #{order.id.slice(-8)}</h1>
            <p className="text-gray-600 text-sm">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg border font-semibold text-sm ${statusColor}`}>
            {order.status.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-600 mb-1">Sponsor</p>
            <p className="font-semibold">{order.sponsor.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Points</p>
            <p className="font-semibold text-green-600 text-xl">
              {order.totalPoints.toLocaleString()} points
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Order Items ({order.items.length})</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
              {/* Image */}
              <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
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
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
                <p className="text-sm text-gray-600">
                  {item.pointPrice.toLocaleString()} points each
                </p>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {(item.pointPrice * item.quantity).toLocaleString()} pts
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/driver/orders"
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition"
        >
          View All Orders
        </Link>
        <Link
          href="/driver/catalog"
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg text-center font-semibold hover:bg-gray-300 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}