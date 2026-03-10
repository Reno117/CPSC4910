import { prisma } from "@/lib/prisma";

/**
 * Get catalog products for a driver's sponsor with point prices
 */
export async function getDriverCatalog(driverProfileId: string, sponsorIdOverride?: string) {
  const sponsorships = await prisma.$queryRaw<{
    sponsorOrgId: string;
    sponsorId: string;
    sponsorName: string;
    pointValue: number;
  }[]>`
    SELECT
      sb.sponsorOrgId,
      s.id AS sponsorId,
      s.name AS sponsorName,
      s.pointValue
    FROM sponsored_by sb
    INNER JOIN sponsor s ON s.id = sb.sponsorOrgId
    WHERE sb.driverId = ${driverProfileId}
  `;

  if (sponsorships.length === 0) {
    return { products: [], pointValue: 0.01, sponsorName: null };
  }

  const activeSponsor = sponsorIdOverride 
    ? sponsorships.find(s => s.sponsorOrgId === sponsorIdOverride)
    : sponsorships[0];
  
  if(!activeSponsor) {
    return { products: [], pointValue: 0.01, sponsorName: null };
  }

  const products = await prisma.catalogProduct.findMany({
    where: {
      sponsorId: activeSponsor.sponsorId,
       isActive: true, // Only show active products
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    products,
    pointValue: Number(activeSponsor.pointValue),
    sponsorName: activeSponsor.sponsorName,
    activeSponsorId: activeSponsor.sponsorId,
    
  };
}

/**
 * Convert USD price to points
 */
export function calculatePointPrice(usdPrice: number, pointValue: number): number {
  return Math.ceil(usdPrice / pointValue);
}