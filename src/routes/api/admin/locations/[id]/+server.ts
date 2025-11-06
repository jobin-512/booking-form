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


    const locationId = params.id;
    if (!locationId) {
      return json({ error: 'Location ID is required' }, { status: 400 });
    }

    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        _count: {
          select: {
            contactForms: true
          }
        }
      }
    });

    if (!location) {
      return json({ error: 'Location not found' }, { status: 404 });
    }

    // Check if location has associated contact forms
    if (location._count.ContactForm > 0) {
      return json({ 
        error: `Cannot delete location "${location.name}" because it has ${location._count.ContactForm} associated contact form(s). Please reassign or delete the contact forms first.` 
      }, { status: 400 });
    }

    // Delete the location
    await prisma.location.delete({
      where: { id: locationId }
    });

    return json({
      success: true,
      message: `Location "${location.name}" has been deleted successfully`
    });
  } catch (error) {
    console.error('Delete location error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request, params }) => {
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


    const locationId = params.id;
    if (!locationId) {
      return json({ error: 'Location ID is required' }, { status: 400 });
    }

    const { name, address, email, isActive } = await request.json();

    if (!name) {
      return json({ error: 'Location name is required' }, { status: 400 });
    }

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!existingLocation) {
      return json({ error: 'Location not found' }, { status: 404 });
    }

    // Check if another location with the same name exists
    const duplicateLocation = await prisma.location.findFirst({
      where: {
        name,
        id: { not: locationId }
      }
    });

    if (duplicateLocation) {
      return json({ error: 'Location with this name already exists' }, { status: 409 });
    }

    // Update the location
    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        name,
        address: address || null,
        email: email || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return json({
      success: true,
      location: updatedLocation,
      message: `Location "${updatedLocation.name}" updated successfully`
    });
  } catch (error) {
    console.error('Update location error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
