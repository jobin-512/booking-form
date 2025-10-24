import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getUserByEmail, verifyPassword, generateToken } from '$lib/auth.js';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role
    });

    return json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
