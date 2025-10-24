import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { verifyToken } from '$lib/auth.js';
import { prisma } from '$lib/db.js';

export const GET: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return json({ error: 'Access denied. Admin role required.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

