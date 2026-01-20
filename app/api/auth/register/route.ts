import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withDb } from '@/lib/middleware/withAuthAndDb';
import User from '@/lib/db/models/User';
import { hashPassword, generateToken } from '@/lib/utils/auth';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
});

export const POST = withDb(async (request: NextRequest) => {
  // Parse request body
  const body = await request.json();

  // Validate input
  const validationResult = registerSchema.safeParse(body);
  
  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validationResult.error.issues },
      { status: 400 }
    );
  }

  const { email, password, name } = validationResult.data;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    return NextResponse.json(
      { error: 'User with this email already exists' },
      { status: 409 }
    );
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create new user with default preferences
  const user = await User.create({
    email,
    name,
    passwordHash,
    preferences: {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light',
      notifications: {
        budgetAlerts: true,
        goalReminders: true,
        weeklyReports: false,
        transactionUpdates: true,
        insightNotifications: true,
      },
    },
  });

  // Generate JWT token
  const token = generateToken(user._id.toString());

  // Create response with HTTP-only cookie
  const response = NextResponse.json(
    {
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
      message: 'User registered successfully',
    },
    { status: 201 }
  );

  // Set HTTP-only cookie
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
});
