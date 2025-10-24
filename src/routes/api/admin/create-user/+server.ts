import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getUserByEmail, createUser, verifyToken } from '$lib/auth.js';

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

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return json({ error: 'Access denied. Admin role required.' }, { status: 403 });
    }

    const { name, email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return json({ error: 'User already exists with this email' }, { status: 409 });
    }

    const user = await createUser(email, password, name);

    return json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
