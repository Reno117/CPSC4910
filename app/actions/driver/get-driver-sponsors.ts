"use server";

import { prisma } from "@/lib/prisma"; // adjust to your prisma client path

export interface DriverSponsor {
  id: string;
  name: string;
  points: number;
  pointValue: number;
}

export async function getDriverSponsors(driverId: string): Promise<DriverSponsor[]> {
  const sponsorships = await prisma.$queryRaw<{
    sponsorId: string;
    sponsorName: string;
    pointValue: number;
    points: number;
  }[]>`
    SELECT
      s.id AS sponsorId,
      s.name AS sponsorName,
      s.pointValue,
      sb.points
    FROM sponsored_by sb
    INNER JOIN sponsor s ON s.id = sb.sponsorOrgId
    WHERE sb.driverId = ${driverId}
  `;

  return sponsorships.map((s) => ({
    id: s.sponsorId,
    name: s.sponsorName,
    points: Number(s.points),
    pointValue: Number(s.pointValue),
  }));
}
