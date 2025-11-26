import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowUpRight, ArrowDownRight, Users } from "lucide-react";

interface Transaction {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
  status: string;
  type: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="border-green-100 bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-green-800">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-xl border border-green-100 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-transparent transition-all hover:shadow-md hover:border-green-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
                  transaction.type === 'income' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : transaction.type === 'salary'
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                    : 'bg-gradient-to-br from-orange-500 to-red-500'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  ) : transaction.type === 'salary' ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-green-800">{transaction.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-green-600">{transaction.category}</p>
                    <span className="text-xs text-green-400">•</span>
                    <p className="text-xs text-green-600">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <p className={`${
                  transaction.amount > 0 ? 'text-green-600' : 'text-orange-800'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                </p>
                <Badge variant="outline" className={`text-xs ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}