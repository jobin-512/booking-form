import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getUserByEmail, createUser, generateToken } from '$lib/auth.js';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password, name } = await request.json();

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
    console.error('Registration error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
