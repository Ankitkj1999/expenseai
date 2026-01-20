import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/middleware/auth';
import User from '@/lib/db/models/User';
import { CURRENCY_CODES } from '@/lib/constants/currencies';
import { DATE_FORMAT_VALUES } from '@/lib/constants/dateFormats';

// Validation schema for preferences update
const updatePreferencesSchema = z.object({
  currency: z.enum(CURRENCY_CODES).optional(),
  dateFormat: z.enum(DATE_FORMAT_VALUES).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  notifications: z.object({
    budgetAlerts: z.boolean().optional(),
    goalReminders: z.boolean().optional(),
    weeklyReports: z.boolean().optional(),
    transactionUpdates: z.boolean().optional(),
    insightNotifications: z.boolean().optional(),
  }).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticate(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = updatePreferencesSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { currency, dateFormat, theme, notifications } = validationResult.data;

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (currency) updateData['preferences.currency'] = currency;
    if (dateFormat) updateData['preferences.dateFormat'] = dateFormat;
    if (theme) updateData['preferences.theme'] = theme;
    
    // Update individual notification preferences
    if (notifications) {
      if (notifications.budgetAlerts !== undefined) {
        updateData['preferences.notifications.budgetAlerts'] = notifications.budgetAlerts;
      }
      if (notifications.goalReminders !== undefined) {
        updateData['preferences.notifications.goalReminders'] = notifications.goalReminders;
      }
      if (notifications.weeklyReports !== undefined) {
        updateData['preferences.notifications.weeklyReports'] = notifications.weeklyReports;
      }
      if (notifications.transactionUpdates !== undefined) {
        updateData['preferences.notifications.transactionUpdates'] = notifications.transactionUpdates;
      }
      if (notifications.insightNotifications !== undefined) {
        updateData['preferences.notifications.insightNotifications'] = notifications.insightNotifications;
      }
    }

    // Update user preferences
    const updatedUser = await User.findByIdAndUpdate(
      authResult.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          preferences: updatedUser.preferences,
        },
        message: 'Preferences updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
