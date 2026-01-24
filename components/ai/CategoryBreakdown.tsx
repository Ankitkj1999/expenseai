'use client';

import { AIComponentCard } from './AIComponentCard';

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
    <AIComponentCard 
      title="Category Breakdown" 
      subtitle={`${categories.length} categories`}
    >
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Chart Section */}
          <div className="h-[200px] w-full relative group">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="amount"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${currency}${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ color: '#1f2937', fontWeight: 600, fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center transition-transform group-hover:scale-110 duration-200">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total</p>
                <p className="font-bold text-lg">
                  {currency}{categories.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between group hover:bg-muted/30 p-2 rounded-lg transition-colors -mx-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-transparent group-hover:ring-offset-1 transition-all"
                    style={{ backgroundColor: category.color, borderColor: category.color }}
                  ></div>
                  <span className="font-medium text-sm truncate max-w-[120px]" title={category.name}>
                    {category.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{currency}{category.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground font-medium">{category.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AIComponentCard>
  );
}
