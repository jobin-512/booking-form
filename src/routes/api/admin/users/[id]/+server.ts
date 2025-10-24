import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { verifyToken } from '$lib/auth.js';
import { prisma } from '$lib/db.js';

export const DELETE: RequestHandler = async ({ request, params }) => {
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

    const userId = params.id;
    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if trying to delete self
    if (userId === decoded.userId) {
      return json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Get the user to check if they are admin
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true }
    });

    if (!userToDelete) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deletion of admin users
    if (userToDelete.role === 'admin') {
      return json({ error: 'Cannot delete admin users' }, { status: 403 });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    return json({
      success: true,
      message: `User ${userToDelete.email} has been deleted successfully`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

