import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "sponsor") return NextResponse.json({ sponsorName: null });

    const sponsorName = user.sponsorUser?.sponsor?.name ?? null;

    return NextResponse.json({ sponsorName });
  } catch (e) {
    console.error("GET /api/user/sponsor/organization error:", e);
    return NextResponse.json({ sponsorName: null }, { status: 200 });
  }
}