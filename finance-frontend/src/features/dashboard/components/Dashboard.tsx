import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import {
  DollarSign,
  Building2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  LogOut,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  Menu,
  ChevronDown,
  FileText,
  Receipt,
  Settings,
  LayoutDashboard,
  Banknote,
  FileDown
} from "lucide-react";
import { CashflowChart } from "./CashflowChart";
import { ExpenseDonutChart } from "./ExpenseDonutChart";
import { RecentTransactions } from "./RecentTransactions";
import { EmployeeList } from "@features/employees/components/EmployeeList";
import { ProjectList } from "@features/projects/components/ProjectList";
import { AccountList } from "@features/accounts/components/AccountList";
import { GroupList } from "@features/groups/components/GroupList";
import { IncomeList } from "@features/income/components/IncomeList";
import { ExpenseList } from "@features/expenses/components/ExpenseList";
interface DashboardProps {
  onLogout: () => void;
}

// Mock data - Replace with API calls to Laravel backend
const mockBankBalances = [
  { id: 1, name: "HDFC Bank", balance: 125000, color: "from-blue-500 to-blue-600", percentage: 46 },
  { id: 2, name: "ICICI Bank", balance: 85000, color: "from-purple-500 to-purple-600", percentage: 31 },
  { id: 3, name: "SBI", balance: 45000, color: "from-indigo-500 to-indigo-600", percentage: 17 },
  { id: 4, name: "Cash", balance: 15000, color: "from-green-500 to-green-600", percentage: 6 },
];

const mockMonthlyData = [
  { month: "Jan", income: 75000, expense: 45000 },
  { month: "Feb", income: 82000, expense: 48000 },
  { month: "Mar", income: 78000, expense: 52000 },
  { month: "Apr", income: 85000, expense: 46000 },
  { month: "May", income: 90000, expense: 55000 },
  { month: "Jun", income: 88000, expense: 51000 },
  { month: "Jul", income: 92000, expense: 49000 },
  { month: "Aug", income: 87000, expense: 53000 },
  { month: "Sep", income: 95000, expense: 48000 },
  { month: "Oct", income: 91000, expense: 54000 },
  { month: "Nov", income: 89000, expense: 50000 },
];

const mockExpenseCategories = [
  { name: "Rent & Living", value: 125000, percentage: 42, color: "#10b981" },
  { name: "Food & Drink", value: 58000, percentage: 19, color: "#3b82f6" },
  { name: "Transportation", value: 45000, percentage: 15, color: "#8b5cf6" },
  { name: "Entertainment", value: 38000, percentage: 13, color: "#f59e0b" },
  { name: "Healthcare", value: 32000, percentage: 11, color: "#ef4444" },
];

const mockRecentTransactions = [
  { id: 1, name: "Salary Credit", category: "Income", amount: 85000, date: "2024-11-20", status: "completed", type: "income" },
  { id: 2, name: "Rent Payment", category: "Housing", amount: -25000, date: "2024-11-18", status: "completed", type: "expense" },
  { id: 3, name: "Grocery Shopping", category: "Food", amount: -5500, date: "2024-11-17", status: "completed", type: "expense" },
  { id: 4, name: "Freelance Project", category: "Income", amount: 35000, date: "2024-11-15", status: "pending", type: "income" },
  { id: 5, name: "Employee Salary", category: "Salary", amount: -45000, date: "2024-11-10", status: "completed", type: "salary" },
];

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [accountOpen, setAccountOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const totalBalance = mockBankBalances.reduce((sum, bank) => sum + bank.balance, 0);
  const totalIncome = mockMonthlyData.reduce((sum, data) => sum + data.income, 0);
  const totalExpenses = mockExpenseCategories.reduce((sum, cat) => sum + cat.value, 0);
  const currentMonthIncome = mockMonthlyData[mockMonthlyData.length - 1]?.income || 0;
  const currentMonthExpense = mockMonthlyData[mockMonthlyData.length - 1]?.expense || 0;
  const savings = currentMonthIncome - currentMonthExpense;
  const savingsPercentage = ((savings / currentMonthIncome) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50">
      {/* Header */}
      <header className="bg-white border-b border-green-100/50 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-green-800">Income & Expense Tracker</h1>
              </div>
              
              {/* Navigation Menu */}
              <nav className="hidden lg:flex items-center gap-2">
                {/* Dashboard */}
                <Button
                  size="sm"
                  variant={activeMenu === "Dashboard" ? "default" : "ghost"}
                  onMouseEnter={() => setHoveredMenu("Dashboard")}
                  onMouseLeave={() => setHoveredMenu(null)}
                  style={{
                    backgroundColor: activeMenu === "Dashboard"
                      ? undefined
                      : hoveredMenu === "Dashboard"
                        ? "#dcfce7"
                        : undefined
                  }}
                  className={activeMenu === "Dashboard"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    : "text-green-700 transition-all"}
                  onClick={() => setActiveMenu("Dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Button>

                {/* Income */}
                <Button
                  size="sm"
                  variant={activeMenu === "Income" ? "default" : "ghost"}
                  onMouseEnter={() => setHoveredMenu("Income")}
                  onMouseLeave={() => setHoveredMenu(null)}
                  style={{
                    backgroundColor: activeMenu === "Income"
                      ? undefined
                      : hoveredMenu === "Income"
                        ? "#dcfce7"
                        : undefined
                  }}
                  className={activeMenu === "Income"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    : "text-green-700 transition-all"}
                  onClick={() => setActiveMenu("Income")}
                >
                  <TrendingUp className="w-4 h-4 mr-1.5" />
                  Income
                </Button>

                {/* Expenses */}
                <Button
                  size="sm"
                  variant={activeMenu === "Expenses" ? "default" : "ghost"}
                  onMouseEnter={() => setHoveredMenu("Expenses")}
                  onMouseLeave={() => setHoveredMenu(null)}
                  style={{
                    backgroundColor: activeMenu === "Expenses"
                      ? undefined
                      : hoveredMenu === "Expenses"
                        ? "#dcfce7"
                        : undefined
                  }}
                  className={activeMenu === "Expenses"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    : "text-green-700 transition-all"}
                  onClick={() => setActiveMenu("Expenses")}
                >
                  <TrendingDown className="w-4 h-4 mr-1.5" />
                  Expenses
                </Button>

                {/* Salary */}
                <Button
                  size="sm"
                  variant={activeMenu === "Salary" ? "default" : "ghost"}
                  onMouseEnter={() => setHoveredMenu("Salary")}
                  onMouseLeave={() => setHoveredMenu(null)}
                  style={{
                    backgroundColor: activeMenu === "Salary"
                      ? undefined
                      : hoveredMenu === "Salary"
                        ? "#dcfce7"
                        : undefined
                  }}
                  className={activeMenu === "Salary"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    : "text-green-700 transition-all"}
                  onClick={() => setActiveMenu("Salary")}
                >
                  <Banknote className="w-4 h-4 mr-1.5" />
                  Salary
                </Button>

                {/* TDS */}
                <Button
                  size="sm"
                  variant={activeMenu === "TDS" ? "default" : "ghost"}
                  onMouseEnter={() => setHoveredMenu("TDS")}
                  onMouseLeave={() => setHoveredMenu(null)}
                  style={{
                    backgroundColor: activeMenu === "TDS"
                      ? undefined
                      : hoveredMenu === "TDS"
                        ? "#dcfce7"
                        : undefined
                  }}
                  className={activeMenu === "TDS"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    : "text-green-700 transition-all"}
                  onClick={() => setActiveMenu("TDS")}
                >
                  <FileDown className="w-4 h-4 mr-1.5" />
                  TDS
                </Button>

                {/* Settings Menu */}
                <div
                  className="relative"
                  onMouseEnter={() => {
                    setIsSettingsOpen(true);
                    setHoveredMenu("Settings");
                  }}
                  onMouseLeave={() => {
                    setIsSettingsOpen(false);
                    setHoveredMenu(null);
                  }}
                >
                  <Button
                    size="sm"
                    variant={["Accounts", "Employees", "Projects", "Groups"].includes(activeMenu) ? "default" : "ghost"}
                    style={{
                      backgroundColor: ["Accounts", "Employees", "Projects", "Groups"].includes(activeMenu)
                        ? undefined
                        : hoveredMenu === "Settings"
                          ? "#dcfce7"
                          : undefined
                    }}
                    className={["Accounts", "Employees", "Projects", "Groups"].includes(activeMenu)
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                      : "text-green-700 transition-all"}
                  >
                    <Settings className="w-4 h-4 mr-1.5" />
                    Settings
                  </Button>

                  {isSettingsOpen && (
                    <div className="absolute right-0 top-full pt-1 w-52 z-50">
                      <div className="bg-white border border-green-200 rounded-md shadow-lg py-1">
                        <button
                          onMouseEnter={() => setHoveredItem("Accounts")}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            backgroundColor: hoveredItem === "Accounts" ? "#dcfce7" : "transparent"
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-green-700 flex items-center gap-2 transition-all cursor-pointer"
                          onClick={() => {
                            setActiveMenu("Accounts");
                            setIsSettingsOpen(false);
                          }}
                        >
                          <Building2 className="w-4 h-4" />
                          Accounts
                        </button>
                        <button
                          onMouseEnter={() => setHoveredItem("Employees")}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            backgroundColor: hoveredItem === "Employees" ? "#dcfce7" : "transparent"
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-green-700 flex items-center gap-2 transition-all cursor-pointer"
                          onClick={() => {
                            setActiveMenu("Employees");
                            setIsSettingsOpen(false);
                          }}
                        >
                          <Users className="w-4 h-4" />
                          Employees
                        </button>
                        <button
                          onMouseEnter={() => setHoveredItem("Projects")}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            backgroundColor: hoveredItem === "Projects" ? "#dcfce7" : "transparent"
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-green-700 flex items-center gap-2 transition-all cursor-pointer"
                          onClick={() => {
                            setActiveMenu("Projects");
                            setIsSettingsOpen(false);
                          }}
                        >
                          <FileText className="w-4 h-4" />
                          Projects
                        </button>
                        <button
                          onMouseEnter={() => setHoveredItem("Groups")}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            backgroundColor: hoveredItem === "Groups" ? "#dcfce7" : "transparent"
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-green-700 flex items-center gap-2 transition-all cursor-pointer"
                          onClick={() => {
                            setActiveMenu("Groups");
                            setIsSettingsOpen(false);
                          }}
                        >
                          <Building2 className="w-4 h-4" />
                          Groups
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-green-800">Andrew Forbist</p>
                <p className="text-xs text-green-600">Admin</p>
              </div>
              <Avatar className="border-2 border-green-200">
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  AF
                </AvatarFallback>
              </Avatar>
              <Button
                onClick={onLogout}
                variant="outline"
                size="icon"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeMenu === "Employees" ? (
          <EmployeeList />
        ) : activeMenu === "Projects" ? (
          <ProjectList />
        ) : activeMenu === "Accounts" ? (
          <AccountList />
        ) : activeMenu === "Groups" ? (
          <GroupList />
        ) : activeMenu === "Income" ? (
          <IncomeList />
        ) : activeMenu === "Expenses" ? (
          <ExpenseList />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Balance Card */}
            <Card className="border-green-100 bg-gradient-to-br from-white to-green-50/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription className="text-green-600 flex items-center gap-2 text-xs">
                  <Wallet className="w-3.5 h-3.5" />
                  Total Balance
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <h3 className="text-green-800">₹{totalBalance.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-green-600 mt-2">Across all accounts</p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-green-100 bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800 text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Income
                </Button>
                <Button variant="outline" className="w-full justify-start border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
                <Button variant="outline" className="w-full justify-start border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 shadow-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Pay Salary
                </Button>
              </CardContent>
            </Card>

            {/* Bank Accounts */}
            <Card className="border-green-100 bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800 text-base">Bank Accounts</CardTitle>
                <CardDescription>Current balances</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockBankBalances.map((bank) => (
                  <div key={bank.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-green-50/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {bank.name === "Cash" ? (
                        <Wallet className="w-4 h-4 text-green-600" />
                      ) : (
                        <Building2 className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-sm text-green-700">{bank.name}</span>
                    </div>
                    <span className="text-sm text-green-800">₹{bank.balance.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-green-100 bg-gradient-to-br from-white to-green-50/30 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 text-xs">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +12.5%
                    </Badge>
                  </div>
                  <p className="text-xs text-green-600 mb-1">Total Income</p>
                  <h3 className="text-green-800">₹{totalIncome.toLocaleString('en-IN')}</h3>
                </CardContent>
              </Card>

              <Card className="border-orange-100 bg-gradient-to-br from-white to-orange-50/30 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingDown className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50 text-xs">
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                      -8.2%
                    </Badge>
                  </div>
                  <p className="text-xs text-orange-600 mb-1">Total Expense</p>
                  <h3 className="text-orange-800">₹{totalExpenses.toLocaleString('en-IN')}</h3>
                </CardContent>
              </Card>

              <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/30 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
                      {savingsPercentage}%
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-600 mb-1">Total Savings</p>
                  <h3 className="text-blue-800">₹{savings.toLocaleString('en-IN')}</h3>
                </CardContent>
              </Card>
            </div>

            {/* Cashflow Chart */}
            <CashflowChart data={mockMonthlyData} />

            {/* Recent Transactions */}
            <RecentTransactions transactions={mockRecentTransactions} />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Expense Statistics */}
            <Card className="border-green-100 bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-800 text-base">Statistics</CardTitle>
                  <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50">
                    This Month
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ExpenseDonutChart data={mockExpenseCategories} />
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card className="border-green-100 bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800 text-base">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockExpenseCategories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-green-700">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">{category.percentage}%</span>
                      <span className="text-sm text-green-800">₹{(category.value / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Salary Summary */}
            <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-800 text-base flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  Salary Paid (2024)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-purple-800 mb-2">₹1,83,000</h3>
                <p className="text-sm text-purple-600 mb-4">2 Employees • 11 months</p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white border border-purple-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700">John Doe</span>
                      <span className="text-sm text-purple-800">₹99,000</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-purple-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700">Jane Smith</span>
                      <span className="text-sm text-purple-800">₹84,000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        )}
      </main>
    </div>
  );
}