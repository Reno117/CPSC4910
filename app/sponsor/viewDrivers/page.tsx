import { prisma } from "@/lib/prisma";
import { requireSponsorUser } from "@/lib/auth-helpers";
import Link from "next/link";

export default async function DriversPage() {
  const sponsorUser = await requireSponsorUser();
  const sponsorId = sponsorUser.sponsorUser!.sponsorId;

  const drivers = await prisma.driverProfile.findMany({
    where: {
      sponsorId: sponsorId,
      status: "active",
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Drivers</h1>
      
      <div className="grid gap-4">
        {drivers.map((driver) => (
          <Link
            key={driver.id}
            href={`/sponsor/drivers/${driver.id}`}
            className="p-4 border rounded hover:bg-gray-50"
          >
            <h3 className="font-semibold">{driver.user.name}</h3>
            <p className="text-sm text-gray-600">{driver.user.email}</p>
            <p className="text-lg font-bold text-green-600">
              {driver.pointsBalance} points
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}