import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withDb } from '@/lib/middleware/withAuthAndDb';
import User from '@/lib/db/models/User';
import { comparePassword, generateToken } from '@/lib/utils/auth';
import { CommonSchemas } from '@/lib/utils/validation';

// Validation schema
const loginSchema = z.object({
  email: CommonSchemas.email,
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password cannot exceed 128 characters'),
});

export const POST = withDb(async (request: NextRequest) => {
  // Parse request body
  const body = await request.json();

  // Validate input
  const validationResult = loginSchema.safeParse(body);
  
  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validationResult.error.issues },
      { status: 400 }
    );
  }

  const { email, password } = validationResult.data;

  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  
  if (!isPasswordValid) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

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
      message: 'Login successful',
    },
    { status: 200 }
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
