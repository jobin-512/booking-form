import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    // Update the user with email admin@test.com to have admin role
    const updatedUser = await prisma.user.update({
      where: {
        email: 'admin@test.com'
      },
      data: {
        role: 'admin'
      }
    });
    
    console.log('User updated successfully:', updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();