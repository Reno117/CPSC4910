import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminHeader from "../../components/AdminComponents/AdminHeader";
import { updateDriverProfile } from "@/app/actions/admin/update-driver-profile";
import Link from "next/link";
import DriverEditForm from "../../components/AdminComponents/DriverEditForm";

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

          <DriverEditForm 
            driver={driver}
            sponsors={sponsors}
            updateAction={updateDriverProfile}
          />
        </section>
      </main>
    </div>
  );
}
