import DriverHeader from "@/app/components/DriverComponents/DriverHeader";
import { auth } from "@/lib/auth";
import { checkDriverNotDisabled } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export default async function MySponsorPage() {
    await checkDriverNotDisabled();


    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("Session user ID:", session?.user.id);

    let sponsors: { id: string; name: string }[] = [];

    if (session?.user?.id) {
      const driverProfile = await prisma.driverProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
        },
      });

      if (driverProfile) {
        const sponsorshipRows = await prisma.$queryRaw<{ sponsorId: string; sponsorName: string }[]>`
          SELECT
            s.id AS sponsorId,
            s.name AS sponsorName
          FROM sponsored_by sb
          INNER JOIN sponsor s ON s.id = sb.sponsorOrgId
          WHERE sb.driverId = ${driverProfile.id}
          ORDER BY s.name ASC
        `;

        sponsors = sponsorshipRows.map((row) => ({
          id: row.sponsorId,
          name: row.sponsorName,
        }));
      }
    }

    return (
      <div>
        <DriverHeader />
        <div className="pt-16 p-8">
          <h1 className="text-3xl font-bold mb-4">My Sponsor</h1>
          {sponsors.length > 0 ? (
            <ul className="space-y-2">
              {sponsors.map(sponsor => (
                <li key={sponsor.id} className="text-lg text-gray-800">
                  {sponsor.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No sponsor assigned yet.</p>
          )}
        </div>
      </div>
    );
}
