'use client';

interface CategoryBreakdownProps {
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  currency: string;
}

export function CategoryBreakdown({ categories, currency }: CategoryBreakdownProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Category Breakdown</h3>
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="font-medium">{category.name}</span>
            </div>
            <div className="text-right">
              <div className="font-bold">{currency}{category.amount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{category.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
