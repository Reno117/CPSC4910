import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminHeader from "../../components/AdminComponents/AdminHeader";
import { updateDriverProfile } from "@/app/actions/admin/update-driver-profile";
import Link from "next/link";

interface AdminDriverEditPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminDriverEditPage({ params, searchParams }: AdminDriverEditPageProps) {
  const { id } = await params;
  const { saved, error } = await searchParams;

  const [driver, sponsors] = await Promise.all([
    prisma.driverProfile.findUnique({
      where: { id },
      include: {
        user: true,
        sponsor: true,
      },
    }),
    prisma.sponsor.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!driver) {
    notFound();
  }

  return (
    <div>
      <AdminHeader />

      <main className="pt-24 px-6 min-h-screen flex flex-col items-center">
        <section className="w-full max-w-3xl bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Driver Profile</h1>
          <p className="text-sm text-gray-600 mb-6">Update driver and user fields, then click save to permanently apply changes.</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Link
              href={`/admin/${driver.id}/orders`}
              className="inline-flex rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
            >
              View Order History
            </Link>
            <Link
              href={`/admin/${driver.id}/transactions`}
              className="inline-flex rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
            >
              View Point Transactions
            </Link>
          </div>

          {saved === "1" && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Driver profile updated successfully.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to save changes. Please verify the form values and try again.
            </div>
          )}

          <form action={updateDriverProfile} className="space-y-4">
            <input type="hidden" name="driverId" value={driver.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Driver ID</label>
                <input
                  value={driver.id}
                  disabled
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">User ID</label>
                <input
                  value={driver.userId}
                  disabled
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Name</label>
              <input
                name="name"
                defaultValue={driver.user.name}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={driver.user.email}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Image URL</label>
              <input
                name="image"
                defaultValue={driver.user.image ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={driver.status}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Sponsor Organization</label>
              <select
                name="sponsorId"
                defaultValue={driver.sponsorId ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400"
              >
                <option value="">Unassigned</option>
                {sponsors.map((sponsor) => (
                  <option key={sponsor.id} value={sponsor.id}>
                    {sponsor.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
