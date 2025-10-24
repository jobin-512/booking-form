import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { verifyToken, getUserById } from '$lib/auth.js';

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

    const user = await getUserById(decoded.userId);
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    return json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
