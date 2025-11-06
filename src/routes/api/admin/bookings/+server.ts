import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { verifyToken } from '$lib/auth.js';
import { prisma } from '$lib/db';

export const GET: RequestHandler = async ({ url, request }) => {
  try {
    const authHeader = url.searchParams.get('token') || request.headers.get('authorization');
    
    if (!authHeader || (!authHeader.startsWith('Bearer ') && !authHeader.startsWith('token='))) {
      return json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader.substring(6);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return json({ error: 'Invalid token' }, { status: 401 });
    }


    // Get date filters from query parameters
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const locationId = url.searchParams.get('locationId');

    // Build where clause
    const whereClause: any = {};

    // Date filtering
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // Location filtering
    if (locationId) {
      whereClause.locationId = locationId;
    }

    // Fetch bookings with related location data
    const bookings = await prisma.contactForm.findMany({
      where: whereClause,
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return json({ 
      success: true, 
      bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request }) => {
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


    const { bookingId } = await request.json();

    if (!bookingId) {
      return json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Check if booking exists
    const booking = await prisma.contactForm.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return json({ error: 'Booking not found' }, { status: 404 });
    }

    // Delete the booking
    await prisma.contactForm.delete({
      where: { id: bookingId }
    });

    return json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};