import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, User, Calendar } from "lucide-react";

interface SalaryPayment {
  id: number;
  employee: string;
  amount: number;
  month: string;
}

interface SalarySectionProps {
  salaryData: SalaryPayment[];
}

export function SalarySection({ salaryData }: SalarySectionProps) {
  // Group salary by employee
  const salaryByEmployee = salaryData.reduce((acc, salary) => {
    if (!acc[salary.employee]) {
      acc[salary.employee] = 0;
    }
    acc[salary.employee] += salary.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group salary by month
  const salaryByMonth = salaryData.reduce((acc, salary) => {
    if (!acc[salary.month]) {
      acc[salary.month] = 0;
    }
    acc[salary.month] += salary.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalSalaryPaid = salaryData.reduce((sum, salary) => sum + salary.amount, 0);

  return (
    <div className="space-y-6">
      <Card className="border-purple-100 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-purple-800">Salary Payments</CardTitle>
              <CardDescription className="text-purple-600">
                Total salary paid to employees - Current Year
              </CardDescription>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg border border-purple-100 bg-purple-50/50">
              <div className="flex items-center gap-2 mb-2 text-purple-700">
                <Calendar className="w-4 h-4" />
                <p className="text-sm">Total Paid (Year)</p>
              </div>
              <p className="text-purple-800">₹{totalSalaryPaid.toLocaleString('en-IN')}</p>
            </div>

            {Object.entries(salaryByEmployee).map(([employee, amount]) => (
              <div key={employee} className="p-4 rounded-lg border border-purple-100 bg-purple-50/50">
                <div className="flex items-center gap-2 mb-2 text-purple-700">
                  <User className="w-4 h-4" />
                  <p className="text-sm">{employee}</p>
                </div>
                <p className="text-purple-800">₹{amount.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>

          {/* Monthly Breakdown */}
          <div className="mb-6">
            <h3 className="text-purple-800 mb-3">Monthly Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(salaryByMonth).map(([month, amount]) => (
                <div key={month} className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                  <p className="text-sm text-purple-700 mb-1">{month}</p>
                  <p className="text-purple-800">₹{amount.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Payment List */}
          <div className="border border-purple-100 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50 hover:bg-purple-50">
                  <TableHead className="text-purple-800">Month</TableHead>
                  <TableHead className="text-purple-800">Employee</TableHead>
                  <TableHead className="text-purple-800 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryData.map((salary) => (
                  <TableRow key={salary.id} className="hover:bg-purple-50/50">
                    <TableCell className="text-purple-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        {salary.month}
                      </div>
                    </TableCell>
                    <TableCell className="text-purple-700">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-600" />
                        {salary.employee}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-purple-800">
                      ₹{salary.amount.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
