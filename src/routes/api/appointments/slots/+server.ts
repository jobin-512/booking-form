import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { prisma } from '$lib/db.js';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const locationId = url.searchParams.get('locationId');
    const date = url.searchParams.get('date');

    if (!locationId || !date) {
      return json({ error: 'Location ID and date are required' }, { status: 400 });
    }

    // Parse the date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Define time slots based on day of week
    let timeSlots: string[] = [];
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      // 9AM-11:30AM (9:00, 9:30, 10:00, 10:30, 11:00, 11:30)
      timeSlots = timeSlots.concat(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30']);
      // 1PM-4:30PM (13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30)
      timeSlots = timeSlots.concat(['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']);
    } else if (dayOfWeek === 6) { // Saturday
      // 9AM-5PM (9:00, 9:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00)
      timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
    } else if (dayOfWeek === 0) { // Sunday
      // 9AM-12PM (9:00, 9:30, 10:00, 10:30, 11:00, 11:30, 12:00)
      timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'];
    }

    // Get booked appointments for this date and location
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get booked appointments for this date and location
    // Also check ContactForm to ensure we're not showing deleted appointments
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        locationId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        isBooked: true
      },
      select: {
        timeSlot: true,
        id: true
      }
    });
    
    // Get all contact forms for this date to verify which appointments are still valid
    const contactForms = await prisma.contactForm.findMany({
      where: {
        locationId,
        date: date // Use the string date from the request
      },
      select: {
        timeSlot: true
      }
    });
    
    // Create a set of time slots that are in contact forms (these are the truly booked ones)
    const validBookedSlots = new Set(contactForms.map(form => form.timeSlot));

    // Create slots with availability status
    const slots = timeSlots.map(time => {
      // Only consider a slot booked if it exists in the valid contact forms
      const isBooked = validBookedSlots.has(time);
      return {
        time,
        display: formatTime(time),
        isAvailable: true,
        isBooked
      };
    });

    return json({ slots });
  } catch (error) {
    console.error('Get time slots error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}
