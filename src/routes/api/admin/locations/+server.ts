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


    const locations = await prisma.location.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return json({ locations });
  } catch (error) {
    console.error('Get locations error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
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


    const { name, address, email } = await request.json();

    if (!name) {
      return json({ error: 'Location name is required' }, { status: 400 });
    }

    // Check if location already exists
    const existingLocation = await prisma.location.findUnique({
      where: { name }
    });

    if (existingLocation) {
      return json({ error: 'Location with this name already exists' }, { status: 409 });
    }

    const location = await prisma.location.create({
      data: {
        name,
        address: address || null,
        email: email || null
      }
    });

    return json({
      success: true,
      location,
      message: `Location "${location.name}" created successfully`
    });
  } catch (error) {
    console.error('Create location error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
