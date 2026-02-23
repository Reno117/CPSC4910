import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; 
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate type and size (max 2MB)
    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image must be under 2MB' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;

    await prisma.user.update({
        where: { id: session.user.id },
        data: { image: base64 },
    });

    return NextResponse.json({ image: base64 });
}