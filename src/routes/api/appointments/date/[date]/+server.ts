import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db.js';
import { verifyToken } from '$lib/auth.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, params }) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const userData = verifyToken(token);
  if (!userData) {
    return json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const date = params.date;
    
    // Fetch all appointments since we can't filter by date (field doesn't exist yet)
    const appointments = await prisma.contactForm.findMany({
      include: {
        location: true
      }
    });

    // Filter appointments by date in memory and format them for the response
    const formattedAppointments = appointments
      .filter(appointment => {
        // Filter by the date field that now exists in the schema
        return appointment.date === date;
      })
      .map(appointment => ({
        id: appointment.id,
        firstName: appointment.firstName,
        lastName: appointment.lastName,
        // Use placeholder values for date and timeSlot
        date: date, // Use the requested date as a placeholder
        timeSlot: "09:00", // Default time slot
        locationId: appointment.locationId,
        locationName: appointment.location?.name || 'Unknown'
      }));

    return json({ appointments: formattedAppointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
};