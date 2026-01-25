
import { NextRequest, NextResponse } from 'next/server';
import { importService } from '@/lib/services/importService';
import { authenticate } from '@/lib/middleware/auth';

export async function POST(req: NextRequest) {
    try {
        const authResult = await authenticate(req);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = authResult.user;

        const body = await req.json();
        const { data, options } = body;

        if (!data || !Array.isArray(data)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const result = await importService.executeImport(
            user._id.toString(),
            data,
            options || {
                createMissingCategories: false,
                createMissingAccounts: false,
                duplicateStrategy: 'skip'
            }
        );

        return NextResponse.json({ success: true, result });

    } catch (error) {
        console.error('Import execution error:', error);
        return NextResponse.json({ error: 'Import failed' }, { status: 500 });
    }
}
