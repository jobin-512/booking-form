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
    const appointmentId = params.id;
    
    // Fetch appointment details
    const appointment = await prisma.contactForm.findUnique({
      where: {
        id: appointmentId
      },
      include: {
        location: true
      }
    });

    if (!appointment) {
      return json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Format the appointment for the response
    const formattedAppointment = {
      id: appointment.id,
      firstName: appointment.firstName,
      lastName: appointment.lastName,
      email: appointment.email,
      phoneNumber: appointment.phoneNumber,
      patientDateOfBirth: appointment.patientDateOfBirth,
      insuranceInfo: appointment.insuranceInfo,
      description: appointment.description,
      // Use placeholder values for missing fields
      date: new Date().toISOString().split('T')[0], // Today's date as placeholder
      timeSlot: "09:00", // Default time slot
      locationId: appointment.locationId,
      locationName: appointment.location?.name || 'Unknown',
      createdAt: appointment.createdAt
    };

    return json({ appointment: formattedAppointment });
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    return json({ error: 'Failed to fetch appointment details' }, { status: 500 });
  }
};