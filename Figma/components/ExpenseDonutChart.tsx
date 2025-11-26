import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ExpenseCategory {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface ExpenseDonutChartProps {
  data: ExpenseCategory[];
}

export function ExpenseDonutChart({ data }: ExpenseDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative">
      <div className="h-[200px] w-full min-h-[200px]" style={{ minHeight: '200px' }}>
        <ResponsiveContainer width="100%" height={200} minHeight={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #d1fae5',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-sm text-green-600">Total Expense</p>
        <p className="text-green-800">₹{(total / 1000).toFixed(1)}k</p>
      </div>
    </div>
  );
}