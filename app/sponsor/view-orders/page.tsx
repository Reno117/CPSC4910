import { prisma } from "@/lib/prisma";
import { requireSponsorOrAdmin } from "@/lib/auth-helpers";
import SponsorHeader from "@/app/components/SponsorComponents/SponsorHeader";
import OrderCard from "@/app/components/orders/OrderCard";

export default async function ViewOrders() {
  const { isAdmin, sponsorId } = await requireSponsorOrAdmin();

  const orders = await prisma.order.findMany({
    where: isAdmin
      ? {}
      : { sponsorId: sponsorId! },
    include: {
      driverProfile: {
        include: {
          user: true,
        },
      },
      sponsor: true,
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Count by status
  const pending = orders.filter(o => o.status === "pending").length;
  const processing = orders.filter(o => o.status === "processing").length;
  const shipped = orders.filter(o => o.status === "shipped").length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const cancelled = orders.filter(o => o.status === "cancelled").length;

  return (
    <div>
      <SponsorHeader />
      <div className="container mx-auto p-4 pt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">
            {isAdmin ? "All Orders" : "Driver Orders"}
          </h1>
          <p className="text-gray-600">
            Manage and update order statuses
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-white p-3 rounded-lg border text-center">
            <p className="text-xs text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border text-center">
            <p className="text-xs text-gray-600 mb-1">Processing</p>
            <p className="text-2xl font-bold text-blue-600">{processing}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border text-center">
            <p className="text-xs text-gray-600 mb-1">Shipped</p>
            <p className="text-2xl font-bold text-purple-600">{shipped}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border text-center">
            <p className="text-xs text-gray-600 mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{delivered}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border text-center">
            <p className="text-xs text-gray-600 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{cancelled}</p>
          </div>
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}