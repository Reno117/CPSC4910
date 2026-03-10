import { prisma } from "@/lib/prisma";
import { requireSponsorOrAdmin } from "@/lib/auth-helpers";
import SponsorHeader from "@/app/components/SponsorComponents/SponsorHeader";
import DriverListClient from "@/app/components/SponsorComponents/DriverListClient";
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
    where: { id: session?.user?.id },
    select: {
      name: true,
      email: true,
      role: true,
      image: true,
    },
  });

  // Fetch the sponsor organization (skip if admin viewing all)
  const sponsor =
    !isAdmin && sponsorId
      ? await prisma.sponsor.findUnique({
          where: { id: sponsorId },
          select: { name: true },
        })
      : null;

  // Fetch sponsor users (users associated with this sponsor org)
  const sponsorUsers =
    !isAdmin && sponsorId
      ? await prisma.user.findMany({
          where: {
            sponsorUser: {
              sponsorId: sponsorId,
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      : [];

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

  if (!user) return null;

  return (
    <div>
      <SponsorHeader userSettings={user} />

      <div className="w-full h-130 overflow-hidden">
        <img
          src="/semitruck.jpg"
          alt="Sponsor Dashboard"
          className="w-full h-auto object-cover object-center"
        />
      </div>

      <div
        style={{
          padding: "60px 100px",
          fontFamily: "Arial, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        {/* Sponsor Name */}
        {sponsor && (
          <h1 style={{ fontSize: "40px", color: "#222", marginBottom: "40px" }}>
            {sponsor.name}
          </h1>
        )}
        {isAdmin && (
          <h1 style={{ fontSize: "40px", color: "#222", marginBottom: "40px" }}>
            Admin Overview
          </h1>
        )}

        {/* Side-by-side lists */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            width: "100%",
            maxWidth: "1200px",
            alignItems: "flex-start",
          }}
        >
          {/* Sponsor Users List */}
          {!isAdmin && (
            <div
              style={{
                flex: 1,
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  color: "#333",
                  textAlign: "center",
                  fontSize: "28px",
                }}
              >
                Sponsor Users
              </h2>
              {sponsorUsers.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666" }}>
                  No sponsor users found
                </p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {sponsorUsers.map((u) => (
                    <li
                      key={u.id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #ddd",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <span style={{ fontWeight: "bold", color: "#333" }}>
                        {u.name}
                      </span>
                      <span style={{ fontSize: "14px", color: "#666" }}>
                        {u.email}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Drivers List */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#333",
                textAlign: "center",
                fontSize: "28px",
              }}
            >
              {isAdmin ? "All Registered Drivers" : "Registered Drivers"}
            </h2>
            {drivers.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666" }}>
                No registered drivers
              </p>
            ) : (
              <DriverListClient
                drivers={drivers}
                isAdmin={isAdmin}
                initialCount={10}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
