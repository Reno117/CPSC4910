import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminHeader from "../../../components/AdminComponents/AdminHeader";

interface AdminDriverOrdersPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDriverOrdersPage({ params }: AdminDriverOrdersPageProps) {
  const { id } = await params;

  const driver = await prisma.driverProfile.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  if (!driver) {
    notFound();
  }

  const orders = await prisma.order.findMany({
    where: { driverProfileId: id },
    include: {
      sponsor: true,
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <AdminHeader />

      <main className="pt-24 px-6 min-h-screen flex flex-col items-center">
        <section className="w-full max-w-5xl bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Driver Order History</h1>
              <p className="text-sm text-gray-600">{driver.user.name}</p>
            </div>
            <Link
              href={`/admin/${id}`}
              className="inline-flex rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
            >
              Back to Driver Profile
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
              No orders found for this driver.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 pr-4 text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="py-3 pr-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="py-3 pr-4 text-sm font-semibold text-gray-700">Sponsor</th>
                    <th className="py-3 pr-4 text-sm font-semibold text-gray-700">Items</th>
                    <th className="py-3 pr-4 text-sm font-semibold text-gray-700">Total Points</th>
                    <th className="py-3 pr-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-3 pr-4 text-sm text-gray-900">{order.id}</td>
                      <td className="py-3 pr-4 text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 pr-4 text-sm text-gray-700">{order.sponsor.name}</td>
                      <td className="py-3 pr-4 text-sm text-gray-700">{order.items.length}</td>
                      <td className="py-3 pr-4 text-sm text-gray-700">{order.totalPoints}</td>
                      <td className="py-3 pr-4 text-sm text-gray-700">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
