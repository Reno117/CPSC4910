'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updatePoints(id: string, pointValue: number) {
  await prisma.sponsor.update({
    where: { id },
    data: { pointValue },
  });

  revalidatePath('/sponsor/catalog');
}