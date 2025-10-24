import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { prisma } from '$lib/db.js';

export const GET: RequestHandler = async () => {
  try {
    const locations = await prisma.location.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        address: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return json({ locations });
  } catch (error) {
    console.error('Get active locations error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
