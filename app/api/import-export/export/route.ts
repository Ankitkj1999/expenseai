
import { NextRequest, NextResponse } from 'next/server';
import { exportService } from '@/lib/services/exportService';
import { authenticate } from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
    try {
        const authResult = await authenticate(req);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = authResult.user;

        const { searchParams } = new URL(req.url);
        const format = searchParams.get('format') as 'json' | 'csv' | 'pdf';

        if (!['json', 'csv', 'pdf'].includes(format)) {
            return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
        }

        const data = await exportService.exportData({
            userId: user._id.toString(),
            format
        });

        if (format === 'json') {
            return new NextResponse(JSON.stringify(data, null, 2), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="expenseai-backup-${new Date().toISOString().split('T')[0]}.json"`
                }
            });
        }

        if (format === 'csv') {
            return new NextResponse(data as string, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`
                }
            });
        }

        if (format === 'pdf') {
            return new NextResponse(data as ArrayBuffer, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="report-${new Date().toISOString().split('T')[0]}.pdf"`
                }
            });
        }

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
