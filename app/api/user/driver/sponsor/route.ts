import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getDriverCatalog } from "@/lib/catalog-helpers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "driver") {
      return NextResponse.json({ sponsorName: null }, { status: 200 });
    }

    const driverProfile = user.driverProfile;
    if (!driverProfile) {
      return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
    }

    const catalog = await getDriverCatalog(driverProfile.id);

    return NextResponse.json({
      sponsorName: catalog.sponsorName ?? null,
      pointValue: catalog.pointValue ?? 0.01,
    });
} catch (e) {
    console.error("GET /api/driver/sponsor error:", e);
    return NextResponse.json({ sponsorName: null }, { status: 200 });
    }
}