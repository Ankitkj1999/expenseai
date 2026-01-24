'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
  // Filter out zero amount categories for the chart
  const data = categories.filter(c => c.amount > 0);

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Category Breakdown</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Chart Section */}
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${currency}${value.toLocaleString()}`, 'Amount']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-bold text-lg">
                {currency}{categories.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full ring-2 ring-transparent group-hover:ring-offset-1 transition-all"
                  style={{ backgroundColor: category.color, borderColor: category.color }}
                ></div>
                <span className="font-medium text-sm">{category.name}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{currency}{category.amount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{category.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
