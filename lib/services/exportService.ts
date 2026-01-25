import { Parser } from 'json2csv';
import Transaction from '@/lib/db/models/Transaction';
import Account from '@/lib/db/models/Account';
import Category from '@/lib/db/models/Category';
import Budget from '@/lib/db/models/Budget';
import connectDB from '@/lib/db/mongodb';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
    userId: string;
    format: 'json' | 'csv' | 'pdf';
    dateRange?: { from: Date; to: Date };
}

export const exportService = {
    async exportData({ userId, format, dateRange }: ExportOptions) {
        await connectDB();

        const query: any = { userId };
        if (dateRange) {
            query.date = {
                $gte: dateRange.from,
                $lte: dateRange.to
            };
        }

        // Fetch all relevant data
        const [transactions, accounts, categories, budgets] = await Promise.all([
            Transaction.find(query).populate('categoryId accountId toAccountId').lean(),
            Account.find({ userId }).lean(),
            Category.find({ $or: [{ userId }, { isSystem: true }] }).lean(),
            Budget.find({ userId }).lean(),
        ]);

        if (format === 'json') {
            return {
                meta: {
                    version: '1.0',
                    exportedAt: new Date().toISOString(),
                    recordCounts: {
                        transactions: transactions.length,
                        accounts: accounts.length,
                        categories: categories.length,
                        budgets: budgets.length
                    }
                },
                data: {
                    transactions,
                    accounts,
                    categories,
                    budgets
                }
            };
        }

        if (format === 'csv') {
            // Flatten transactions for CSV
            const flattenedTransactions = transactions.map((t: any) => ({
                Date: new Date(t.date).toISOString().split('T')[0],
                Type: t.type,
                Amount: t.amount,
                Category: t.categoryId?.name || 'Uncategorized',
                Account: t.accountId?.name || 'Unknown Account',
                ToAccount: t.toAccountId?.name || '',
                Description: t.description,
                Tags: t.tags?.join(', ') || '',
                Notes: t.metadata?.notes || ''
            }));

            const parser = new Parser();
            return parser.parse(flattenedTransactions);
        }

        if (format === 'pdf') {
            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text('ExpenseAI Report', 14, 22);

            doc.setFontSize(11);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Total Transactions: ${transactions.length}`, 14, 38);

            const tableData = transactions.map((t: any) => [
                new Date(t.date).toLocaleDateString(),
                t.type.toUpperCase(),
                `${t.categoryId?.name || '-'}`,
                `${t.amount}`,
                t.description,
                t.accountId?.name || '-'
            ]);

            autoTable(doc, {
                head: [['Date', 'Type', 'Category', 'Amount', 'Description', 'Account']],
                body: tableData,
                startY: 45,
                theme: 'striped',
                styles: { fontSize: 8 },
            });

            return doc.output('arraybuffer');
        }

        throw new Error('Unsupported format');
    }
};
