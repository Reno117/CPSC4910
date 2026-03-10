import { prisma } from "@/lib/prisma";
import { requireSponsorOrAdmin } from "@/lib/auth-helpers";
import DriverLists from "../components/SponsorComponents/driver-list";
import SponsorHeader from "../components/SponsorComponents/SponsorHeader"; 
import DriverListClient from "../components/SponsorComponents/DriverListClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type DriverRow = {
  id: string;
  points: number;
  sponsorOrgId: string;
  createdAt: Date;
  driverId: string;
  status: string;
  pointsBalance: number;
  driverName: string;
  driverEmail: string;
  driverImage: string | null;
  sponsorName: string;
};

export default async function SponsorDashboard() {
  const { isAdmin, sponsorId } = await requireSponsorOrAdmin();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = await prisma.user.findUnique({
      where: {id: session?.user?.id},
      select: {
          name: true,
          email: true,
          role: true,
          image: true,
      },
  });
      
  // If admin, show all drivers; if sponsor, show only their drivers
  const rows = isAdmin
    ? await prisma.$queryRaw<DriverRow[]>`
        SELECT
          sb.id,
          sb.points,
          sb.sponsorOrgId,
          sb.createdAt,
          dp.id AS driverId,
          dp.status,
          dp.pointsBalance,
          u.name AS driverName,
          u.email AS driverEmail,
          u.image AS driverImage,
          s.name AS sponsorName
        FROM sponsored_by sb
        INNER JOIN driver_profile dp ON dp.id = sb.driverId
        INNER JOIN user u ON u.id = dp.userId
        INNER JOIN sponsor s ON s.id = sb.sponsorOrgId
        ORDER BY sb.createdAt DESC
      `
    : await prisma.$queryRaw<DriverRow[]>`
        SELECT
          sb.id,
          sb.points,
          sb.sponsorOrgId,
          sb.createdAt,
          dp.id AS driverId,
          dp.status,
          dp.pointsBalance,
          u.name AS driverName,
          u.email AS driverEmail,
          u.image AS driverImage,
          s.name AS sponsorName
        FROM sponsored_by sb
        INNER JOIN driver_profile dp ON dp.id = sb.driverId
        INNER JOIN user u ON u.id = dp.userId
        INNER JOIN sponsor s ON s.id = sb.sponsorOrgId
        WHERE sb.sponsorOrgId = ${sponsorId!}
        ORDER BY sb.createdAt DESC
      `;

  const drivers = rows.map((row) => ({
    id: row.id,
    points: Number(row.points),
    sponsorOrgId: row.sponsorOrgId,
    createdAt: row.createdAt,
    driver: {
      id: row.driverId,
      status: row.status,
      pointsBalance: Number(row.pointsBalance),
      user: {
        name: row.driverName,
        email: row.driverEmail,
        image: row.driverImage,
      },
    },
    sponsorOrg: {
      name: row.sponsorName,
    },
  }));
  if(!user)
  {
    return null;
  }
  return (
    <div>
      <SponsorHeader userSettings= {user}/>

      <div>
        <div className="w-full h-130 overflow-hidden">
          <img
            src="/semitruck.jpg"
            alt="Sponsor Dashboard"
            className="w-full h-auto object-cover object-center"
          />
        </div>
      </div>

      <div style={{
        padding: '100px',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '900px',
          width: '100%',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          padding: '20px',
          justifyContent: 'center'
        }}>
          {/* Header */}
          <h2 style={{ marginTop: 0, color: '#333', textAlign: 'center', fontSize: '35px'}}>
            {isAdmin ? "All Registered Drivers" : "Registered Drivers"}
          </h2>

          {drivers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666'
            }}>
              No registered drivers
            </div>
          ) : (
            <DriverListClient drivers={drivers} isAdmin={isAdmin} initialCount={10} />
          )}
        </div>
      </div>
    </div>
  );
}