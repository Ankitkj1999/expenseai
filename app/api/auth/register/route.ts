import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withDb } from '@/lib/middleware/withAuthAndDb';
import User from '@/lib/db/models/User';
import { hashPassword, generateToken } from '@/lib/utils/auth';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(), // Accept name but don't store it yet
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

  const { email, password } = validationResult.data;

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

  // Create new user
  const user = await User.create({
    email,
    passwordHash,
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
