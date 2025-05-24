import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createApiKey, getUserWithTeam } from '@/lib/db/queries';

export async function POST() {
  try {
    const session = await getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const userId = session.user.id;
    const userWithTeam = await getUserWithTeam(userId);

    if (!userWithTeam.team || !userWithTeam.team.id) {
      return new NextResponse('Team not found', { status: 404 });
    }

    const createdKey = await createApiKey(userWithTeam.team.id);

    return NextResponse.json(createdKey);
  } catch (error) {
    console.error('Error creating API key:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
