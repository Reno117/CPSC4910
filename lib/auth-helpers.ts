import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

function normalizeRole(role: string | null | undefined) {
  return role?.trim().toLowerCase() ?? "";
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  return await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      driverProfile: true,
      sponsorUser: {
        include: {
          sponsor: true,
        },
      },
    },
  });
}

export async function requireSponsorUser() {
  const user = await getCurrentUser();

  if (!user || normalizeRole(user.role) !== "sponsor") {
    throw new Error("Unauthorized: Sponsor access required");
  }

  if (!user.sponsorUser) {
    throw new Error("Sponsor user profile not found");
  }

  return user;
}

// NEW: Allow both sponsors and admins
export async function requireSponsorOrAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const role = normalizeRole(user.role);

  if (role === "admin") {
    return { user, isAdmin: true, sponsorId: null };
  }

  if (role === "sponsor") {
    if (!user.sponsorUser) {
      throw new Error("Sponsor user profile not found");
    }
    if (user.sponsorUser.status === "disabled") {
      throw new Error(
        "Your account has been disabled. Please contact support.",
      );
    }
    return { user, isAdmin: false, sponsorId: user.sponsorUser.sponsorId };
  }

  throw new Error("Unauthorized: Sponsor or Admin access required");
}

export async function requireDriver() {
  const user = await getCurrentUser();

  if (user?.driverProfile) {
    return user;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized: Driver access required");
  }

  const fallbackUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      driverProfile: true,
      sponsorUser: {
        include: {
          sponsor: true,
        },
      },
    },
  });

  if (!fallbackUser?.driverProfile) {
    throw new Error("Unauthorized: Driver access required");
  }

  return fallbackUser;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || normalizeRole(user.role) !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

export async function getDriverStatus(): Promise<string | null> {
  const user = await getCurrentUser();

  if (!user || normalizeRole(user.role) !== "driver" || !user.driverProfile) {
    return null;
  }

  return user.driverProfile.status;
}

/**
 * Check if the current user is a driver with a disabled account
 * Throws error if disabled, otherwise returns normally
 * Does NOT restrict admin/sponsor access
 */
export async function checkDriverNotDisabled() {
  const user = await getCurrentUser();

  if (!user) {
    return; // Not logged in - let route handler deal with it
  }

  // Only check status for drivers
  if (user.role === "driver") {
    if (!user.driverProfile) {
      throw new Error("Driver profile not found");
    }

    if (user.driverProfile.status === "disabled") {
      throw new Error(
        "Your account has been disabled. Please contact your sponsor.",
      );
    }
  }

  // Admins and sponsors pass through without checks
  return;
}
