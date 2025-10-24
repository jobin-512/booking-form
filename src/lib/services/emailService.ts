import nodemailer from 'nodemailer';
import type { ContactForm } from '@prisma/client';
import { prisma } from '$lib/db.js';

// Configure email transporter for Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'appdevmail0101@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'xyuoglajmzmupnie'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Email templates
export const createThankYouEmailTemplate = (contactForm: ContactForm) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 20px 0;">
        <h1>Advanced Dermatology & Skin Cancer Specialists</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2>Thanks so much for requesting an appointment with Advanced Dermatology & Skin Cancer Specialists.</h2>
        
        <p>By choosing a date and time you are requesting an appointment. Someone will contact you to confirm the appointment.</p>
        
        <p><strong>Please do not show up at our offices until you have a confirmed scheduled appointment.</strong></p>
        
        <p>Thank you!</p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #666;">
        <p>Follow us on social media</p>
        <p>
          <a href="https://facebook.com/advanceddermsspecialists" style="margin: 0 10px; color: #3b5998; text-decoration: none;">Facebook</a> | 
          <a href="https://twitter.com/advanceddermsspecialists" style="margin: 0 10px; color: #1da1f2; text-decoration: none;">Twitter</a> | 
          <a href="https://yelp.com/advanceddermsspecialists" style="margin: 0 10px; color: #d32323; text-decoration: none;">Yelp</a>
        </p>
      </div>
    </div>
  `;
};

export const createLocationEmailTemplate = (contactForm: ContactForm) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Appointment Request</h2>
      
      <p>A new appointment has been requested with the following details:</p>
      
      <ul>
        <li><strong>Name:</strong> ${contactForm.firstName} ${contactForm.lastName}</li>
        <li><strong>Email:</strong> ${contactForm.email}</li>
        <li><strong>Phone:</strong> ${contactForm.phoneNumber}</li>
        <li><strong>Date of Birth:</strong> ${contactForm.patientDateOfBirth}</li>
        <li><strong>Insurance:</strong> ${contactForm.insuranceInfo}</li>
        <li><strong>Date:</strong> ${contactForm.date}</li>
        <li><strong>Time:</strong> ${contactForm.timeSlot}</li>
        <li><strong>Description:</strong> ${contactForm.description || 'No description provided'}</li>
      </ul>
      
      <p>Please contact the client to confirm this appointment.</p>
    </div>
  `;
};

// Send thank you email to client
export const sendThankYouEmail = async (contactForm: ContactForm) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Advanced Dermatology & Skin Cancer Specialists" <noreply@advanceddermsspecialists.com>',
      to: contactForm.email,
      subject: 'Thanks for creating an appointment! | advanceddermsspecialists.com',
      html: createThankYouEmailTemplate(contactForm)
    };


    await transporter.sendMail(mailOptions);
    console.log(`Thank you email sent to ${contactForm.email}`);
    return true;
  } catch (error) {
    console.error('Error sending thank you email:', error);
    return false;
  }
};

// Send notification email to location
export const sendLocationEmail = async (contactForm: ContactForm) => {
  try {
    // Get location email from database
    const location = await prisma.location.findUnique({
      where: {
        id: contactForm.locationId
      },
      select: {
        email: true,
        name: true
      }
    });
    
    // Use location email from database or fallback to default
    const locationEmail = (location?.email && location.email.trim() !== '') 
      ? location.email 
      : 'default@advanceddermsspecialists.com';
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Appointment System" <appointments@advanceddermsspecialists.com>',
      to: [locationEmail, "czig.adscs@gmail.com"],
      subject: `New Appointment Request: ${contactForm.firstName} ${contactForm.lastName}`,
      html: createLocationEmailTemplate(contactForm)
    };


    await transporter.sendMail(mailOptions);
    console.log(`Location notification email sent to ${locationEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending location email:', error);
    return false;
  }
};