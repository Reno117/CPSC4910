'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function fireDriver(driverId: string) {
  await prisma.driverProfile.update({
    where: { id: driverId },
    data: {
      sponsorId: null,
      status: 'inactive',
      pointsBalance: 0,
    },
  });

  revalidatePath('/sponsor/catalog');
}