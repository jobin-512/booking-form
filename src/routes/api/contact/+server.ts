import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { prisma } from '$lib/db.js';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      storeInfo, 
      patientDateOfBirth, 
      insuranceInfo, 
      description,
      locationId
    } = await request.json();

    if (!firstName || !lastName || !email || !phoneNumber || !patientDateOfBirth || !insuranceInfo || !description || !locationId) {
      return json({ error: 'All required fields must be filled including preferred location' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: 'Invalid email format' }, { status: 400 });
    }

    const contactForm = await prisma.contactForm.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        storeInfo: storeInfo || false,
        patientDateOfBirth,
        insuranceInfo,
        description,
        locationId
      }
    });

    return json({
      success: true,
      message: 'Thank you for your submission! We will get back to you soon.',
      id: contactForm.id
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
