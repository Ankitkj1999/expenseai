
import { NextRequest, NextResponse } from 'next/server';
import { importService } from '@/lib/services/importService';
import { authenticate } from '@/lib/middleware/auth';
import { parse } from 'csv-parse/sync';

export async function POST(req: NextRequest) {
    try {
        const authResult = await authenticate(req);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = authResult.user;

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        let pasedData: any[] = [];
        const text = await file.text();

        if (file.type === 'application/json' || file.name.endsWith('.json')) {
            try {
                const json = JSON.parse(text);
                pasedData = Array.isArray(json) ? json : (json.data?.transactions || []);
            } catch (e) {
                return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
            }
        } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            try {
                pasedData = parse(text, {
                    columns: true,
                    skip_empty_lines: true,
                    trim: true,
                });

                // Normalize CSV keys to lowercase/standard keys if needed
                // Assuming headers like "Date", "Amount", "Description"...
                pasedData = pasedData.map(row => {
                    const newRow: any = {};
                    Object.keys(row).forEach(key => {
                        const lowerKey = key.toLowerCase();
                        if (lowerKey.includes('date')) newRow.date = row[key];
                        else if (lowerKey.includes('amount')) newRow.amount = row[key];
                        else if (lowerKey.includes('desc')) newRow.description = row[key];
                        else if (lowerKey.includes('cat')) newRow.category = row[key];
                        else if (lowerKey.includes('from') || lowerKey === 'account') newRow.account = row[key];
                        else if (lowerKey.includes('to')) newRow.toAccount = row[key];
                        else if (lowerKey.includes('type')) newRow.type = row[key];
                        else if (lowerKey.includes('tag')) newRow.tags = row[key];
                        else if (lowerKey.includes('note')) newRow.notes = row[key];
                    });
                    // Default type if missing
                    if (!newRow.type) newRow.type = 'expense';
                    return newRow;
                });

            } catch (e) {
                return NextResponse.json({ error: 'Invalid CSV' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        const analysis = await importService.analyzeImport(user._id.toString(), pasedData);

        return NextResponse.json({
            ...analysis,
            // Send back the parsed data so the client can send it back to 'execute'
            // In a real app with huge files, store this in Redis/Session with an ID.
            // For now, round-trip is fine.
            rawParsedData: pasedData
        });

    } catch (error) {
        console.error('Import analysis error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
