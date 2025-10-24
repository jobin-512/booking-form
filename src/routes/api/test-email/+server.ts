import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { sendThankYouEmail, sendLocationEmail } from '$lib/services/emailService.js';

export const POST: RequestHandler = async () => {
  try {
    // Create a test contact form
    const testContactForm = {
      id: 'test-123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '555-123-4567',
      storeInfo: false,
      patientDateOfBirth: '1990-01-01',
      insuranceInfo: 'Test Insurance',
      description: 'This is a test appointment request',
      locationId: 'test-location',
      date: '2024-01-15',
      timeSlot: '09:00',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Testing email functionality...');
    
    // Send both emails
    const [thankYouResult, locationResult] = await Promise.all([
      sendThankYouEmail(testContactForm),
      sendLocationEmail(testContactForm)
    ]);

    console.log('Thank you email result:', thankYouResult);
    console.log('Location email result:', locationResult);

    return json({
      success: true,
      thankYouEmailSent: thankYouResult,
      locationEmailSent: locationResult,
      message: 'Test emails sent successfully!'
    });
  } catch (error) {
    console.error('Test email error:', error);
    return json({ 
      success: false, 
      error: 'Failed to send test emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};