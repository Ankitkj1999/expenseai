import Transaction from '@/lib/db/models/Transaction';
import Account from '@/lib/db/models/Account';
import Category from '@/lib/db/models/Category';
import connectDB from '@/lib/db/mongodb';
import mongoose from 'mongoose';

interface ImportTransaction {
    date: string | Date;
    amount: number;
    description: string;
    category: string;
    account: string;
    type: 'expense' | 'income' | 'transfer';
    toAccount?: string; // For transfers
    tags?: string;
    notes?: string;
}

interface ImportAnalysisResult {
    summary: {
        totalRecords: number;
        validRecords: number;
        invalidRecords: number;
        newCategories: string[];
        newAccounts: string[];
    };
    details: {
        valid: any[];
        invalid: { index: number; record: any; errors: string[] }[];
        duplicates: { index: number; record: any; existingId: string }[];
    };
}

export const importService = {
    /**
     * Analyzes the import data without saving it.
     * Identifies new categories, accounts, and potential duplicates.
     */
    async analyzeImport(userId: string, data: ImportTransaction[]): Promise<ImportAnalysisResult> {
        await connectDB();

        const existingCategories = await Category.find({
            $or: [{ userId }, { isSystem: true }]
        }).distinct('name');

        // Create a Set for faster lookup, normalize to uppercase for case-insensitive comparison
        const existingCategorySet = new Set(existingCategories.map((c: string) => c.toUpperCase()));
        const existingAccounts = await Account.find({ userId }).lean();
        const existingAccountSet = new Set(existingAccounts.map(a => a.name.toUpperCase()));

        const newCategories = new Set<string>();
        const newAccounts = new Set<string>();
        const valid: any[] = [];
        const invalid: any[] = [];
        const duplicates: any[] = [];

        // Helper to check for existing transaction (fuzzy match)
        // We fetch all transactions for the user within the date range of the import to minimize query load
        // For now, let's just check against signatures
        // A signature could be: `${date}_${amount}_${description}`
        // But since dates can vary by time, we might just check strict equality for now.

        // Fetch all user transactions to memory (careful with large datasets, but for pwa it's fine usually < 10k)
        // Optimization: Only fetch fields needed for signature
        const allUserTxns = await Transaction.find({ userId })
            .select('date amount description type')
            .lean();

        const txnSignatures = new Set(allUserTxns.map(t =>
            `${new Date(t.date).toISOString().split('T')[0]}_${t.amount}_${t.description.trim().toLowerCase()}`
        ));

        data.forEach((row, index) => {
            const errors: string[] = [];

            // 1. Basic Validation
            if (!row.amount || isNaN(Number(row.amount))) errors.push('Invalid amount');
            if (!row.date) errors.push('Missing date');
            if (!row.description) errors.push('Missing description');
            if (!['expense', 'income', 'transfer'].includes(row.type?.toLowerCase())) {
                errors.push('Invalid type (must be expense, income, or transfer)');
            }

            // 2. Entity Check
            if (row.category && !existingCategorySet.has(row.category.toUpperCase())) {
                newCategories.add(row.category);
            }
            if (row.account && !existingAccountSet.has(row.account.toUpperCase())) {
                newAccounts.add(row.account);
            }
            if (row.toAccount && !existingAccountSet.has(row.toAccount.toUpperCase())) {
                newAccounts.add(row.toAccount);
            }

            if (errors.length > 0) {
                invalid.push({ index, record: row, errors });
            } else {
                // 3. Duplicate Check
                const signature = `${new Date(row.date).toISOString().split('T')[0]}_${row.amount}_${row.description.trim().toLowerCase()}`;
                if (txnSignatures.has(signature)) {
                    duplicates.push({ index, record: row, existingId: 'potential-match' });
                }

                valid.push({ ...row, index });
            }
        });

        return {
            summary: {
                totalRecords: data.length,
                validRecords: valid.length,
                invalidRecords: invalid.length,
                newCategories: Array.from(newCategories),
                newAccounts: Array.from(newAccounts),
            },
            details: {
                valid,
                invalid,
                duplicates,
            }
        };
    },

    /**
     * Executes the import based on user options.
     */
    async executeImport(
        userId: string,
        data: ImportTransaction[],
        options: {
            createMissingCategories: boolean;
            createMissingAccounts: boolean;
            duplicateStrategy: 'skip' | 'allow'; // 'update' is complex for CSVs without IDs
        }
    ) {
        await connectDB();

        const results = {
            created: 0,
            skipped: 0,
            errors: 0
        };

        // 1. Pre-fetch existing entities to map Names -> IDs
        let userCategories = await Category.find({ $or: [{ userId }, { isSystem: true }] });
        let userAccounts = await Account.find({ userId });

        // 2. Handle missing entities
        if (options.createMissingCategories) {
            const existingNames = new Set(userCategories.map(c => c.name.toUpperCase()));
            const categoriesToCreate = new Set<string>();

            data.forEach(row => {
                if (row.category && !existingNames.has(row.category.toUpperCase())) {
                    categoriesToCreate.add(row.category);
                }
            });

            if (categoriesToCreate.size > 0) {
                const newCats = await Category.insertMany(
                    Array.from(categoriesToCreate).map(name => ({
                        userId,
                        name,
                        type: 'expense', // Default, logic can be smarter
                        isSystem: false,
                        color: '#808080',
                        icon: 'tag'
                    }))
                );
                userCategories = [...userCategories, ...(newCats as any)];
            }
        }

        if (options.createMissingAccounts) {
            const existingNames = new Set(userAccounts.map(a => a.name.toUpperCase()));
            const accountsToCreate = new Set<string>();

            data.forEach(row => {
                if (row.account && !existingNames.has(row.account.toUpperCase())) {
                    accountsToCreate.add(row.account);
                }
            });

            if (accountsToCreate.size > 0) {
                const newAccs = await Account.insertMany(
                    Array.from(accountsToCreate).map(name => ({
                        userId,
                        name,
                        type: 'cash', // Default
                        balance: 0,
                        currency: 'USD' // Should ideally match user pref
                    }))
                );
                userAccounts = [...userAccounts, ...(newAccs as any)];
            }
        }

        // Map for quick ID lookup
        // Helper to find ID case-insensitive
        const getCatId = (name: string) => userCategories.find(c => c.name.toUpperCase() === name?.toUpperCase())?._id;
        const getAccId = (name: string) => userAccounts.find(a => a.name.toUpperCase() === name?.toUpperCase())?._id;

        // 3. Process Transactions
        const transactionsToInsert = [];

        // Re-fetch for duplicate checking if we are skipping
        const allUserTxns = await Transaction.find({ userId }).select('date amount description').lean();
        const txnSignatures = new Set(allUserTxns.map(t =>
            `${new Date(t.date).toISOString().split('T')[0]}_${t.amount}_${t.description.trim().toLowerCase()}`
        ));

        for (const row of data) {
            try {
                // Skip if Duplicate Strategy is SKIP
                if (options.duplicateStrategy === 'skip') {
                    const signature = `${new Date(row.date).toISOString().split('T')[0]}_${row.amount}_${(row.description || '').trim().toLowerCase()}`;
                    if (txnSignatures.has(signature)) {
                        results.skipped++;
                        continue;
                    }
                }

                const categoryId = getCatId(row.category);
                const accountId = getAccId(row.account);
                const toAccountId = row.toAccount ? getAccId(row.toAccount) : undefined;

                // Skip if required entities are missing (and weren't created)
                if (!categoryId || !accountId) {
                    results.errors++; // Or skipped
                    continue;
                }

                transactionsToInsert.push({
                    userId,
                    type: row.type.toLowerCase(),
                    amount: Number(row.amount),
                    description: row.description,
                    date: new Date(row.date),
                    categoryId,
                    accountId,
                    toAccountId,
                    tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
                    metadata: { notes: row.notes }
                });

                results.created++;
            } catch (err) {
                console.error('Row import failed', err);
                results.errors++;
            }
        }

        if (transactionsToInsert.length > 0) {
            await Transaction.insertMany(transactionsToInsert);
        }

        return results;
    }
};
