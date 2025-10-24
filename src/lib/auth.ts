import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  });
}

export async function createUser(email: string, password: string, name?: string, role: string = 'user') {
  const hashedPassword = await hashPassword(password);
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role
    }
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });
}
