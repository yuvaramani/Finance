import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, ShoppingCart, Zap, Car, Tv, Heart, Home } from "lucide-react";

interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
}

interface ExpensesSectionProps {
  expensesData: Expense[];
}

const categoryIcons: Record<string, any> = {
  Groceries: ShoppingCart,
  Utilities: Zap,
  Transportation: Car,
  Entertainment: Tv,
  Healthcare: Heart,
  Other: Home,
};

export function ExpensesSection({ expensesData }: ExpensesSectionProps) {
  // Group expenses by category
  const expensesByCategory = expensesData.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-orange-800">General Expenses</CardTitle>
              <CardDescription className="text-orange-600">
                All expenses tracked - Current Year
              </CardDescription>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {Object.entries(expensesByCategory).map(([category, amount]) => {
              const Icon = categoryIcons[category] || Home;
              const percentage = ((amount / totalExpenses) * 100).toFixed(1);
              
              return (
                <div key={category} className="p-4 rounded-lg border border-orange-100 bg-orange-50/50">
                  <div className="flex items-center gap-2 mb-2 text-orange-700">
                    <Icon className="w-4 h-4" />
                    <p className="text-sm">{category}</p>
                  </div>
                  <p className="text-orange-800 mb-1">₹{amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-orange-600">{percentage}% of total</p>
                </div>
              );
            })}
          </div>

          {/* Expense Transaction List */}
          <div className="border border-orange-100 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-orange-50 hover:bg-orange-50">
                  <TableHead className="text-orange-800">Date</TableHead>
                  <TableHead className="text-orange-800">Category</TableHead>
                  <TableHead className="text-orange-800 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesData.map((expense) => {
                  const Icon = categoryIcons[expense.category] || Home;
                  
                  return (
                    <TableRow key={expense.id} className="hover:bg-orange-50/50">
                      <TableCell className="text-orange-700">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-orange-700">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-orange-600" />
                          {expense.category}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-orange-800">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
