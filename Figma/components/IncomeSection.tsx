import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Building2, Wallet } from "lucide-react";

interface Income {
  id: number;
  source: string;
  amount: number;
  date: string;
  type: string;
}

interface IncomeSectionProps {
  incomeData: Income[];
}

export function IncomeSection({ incomeData }: IncomeSectionProps) {
  // Group income by source (bank/cash)
  const incomeBySource = incomeData.reduce((acc, income) => {
    if (!acc[income.source]) {
      acc[income.source] = 0;
    }
    acc[income.source] += income.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Income by Bank/Cash */}
      <Card className="border-green-100 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-green-800">Income by Bank/Cash</CardTitle>
              <CardDescription className="text-green-600">
                Total income received in each account - Current Year
              </CardDescription>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(incomeBySource).map(([source, amount]) => (
              <div key={source} className="p-4 rounded-lg border border-green-100 bg-green-50/50">
                <div className="flex items-center gap-2 mb-2 text-green-700">
                  {source === "Cash" ? (
                    <Wallet className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                  <p className="text-sm">{source}</p>
                </div>
                <p className="text-green-800">₹{amount.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>

          {/* Income Transaction List */}
          <div className="border border-green-100 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-green-50 hover:bg-green-50">
                  <TableHead className="text-green-800">Date</TableHead>
                  <TableHead className="text-green-800">Source</TableHead>
                  <TableHead className="text-green-800">Type</TableHead>
                  <TableHead className="text-green-800 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeData.map((income) => (
                  <TableRow key={income.id} className="hover:bg-green-50/50">
                    <TableCell className="text-green-700">
                      {new Date(income.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-green-700">
                      <div className="flex items-center gap-2">
                        {income.source === "Cash" ? (
                          <Wallet className="w-4 h-4 text-green-600" />
                        ) : (
                          <Building2 className="w-4 h-4 text-green-600" />
                        )}
                        {income.source}
                      </div>
                    </TableCell>
                    <TableCell className="text-green-700">{income.type}</TableCell>
                    <TableCell className="text-right text-green-800">
                      ₹{income.amount.toLocaleString('en-IN')}
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
