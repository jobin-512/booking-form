import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { prisma } from '$lib/db.js';
import { sendThankYouEmail, sendLocationEmail } from '$lib/services/emailService.js';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { locationId, date, timeSlot, firstName, lastName, email, phoneNumber, patientDateOfBirth, insuranceInfo, description } = await request.json();

    if (!locationId || !date || !timeSlot || !firstName || !lastName || !email || !phoneNumber || !patientDateOfBirth || !insuranceInfo || !description) {
      return json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    // Check if the slot is still available
    const appointmentDate = new Date(date);
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        locationId,
        date: appointmentDate,
        timeSlot,
        isBooked: true
      }
    });

    if (existingAppointment) {
      return json({ error: 'This time slot is no longer available' }, { status: 409 });
    }

    // Create or update appointment
    const appointment = await prisma.appointment.upsert({
      where: {
        locationId_date_timeSlot: {
          locationId,
          date: appointmentDate,
          timeSlot
        }
      },
      update: {
        isBooked: true
      },
      create: {
        locationId,
        date: appointmentDate,
        timeSlot,
        isBooked: true
      }
    });

    // Create contact form entry
    const contactForm = await prisma.contactForm.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        storeInfo: false,
        patientDateOfBirth,
        insuranceInfo,
        description,
        locationId,
        date,
        timeSlot
      }
    });

    // Send emails asynchronously (don't wait for completion)
    try {
      await Promise.all([
        sendThankYouEmail(contactForm),
        sendLocationEmail(contactForm)
      ]);
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Continue with the response even if email sending fails
    }

    return json({
      success: true,
      appointmentId: appointment.id,
      contactFormId: contactForm.id,
      message: 'Appointment booked successfully!'
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
