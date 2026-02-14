import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  FileDown,
  FileSpreadsheet,
  Tag
} from "lucide-react";
import { CashflowChart } from "./CashflowChart";
import { ExpenseDonutChart } from "./ExpenseDonutChart";
import { RecentTransactions } from "./RecentTransactions";
import { EmployeeList } from "@features/employees/components/EmployeeList";
import { ProjectList } from "@features/projects/components/ProjectList";
import { AccountList } from "@features/accounts/components/AccountList";
import { GroupList } from "@features/groups/components/GroupList";
import { IncomeList } from "@features/income/components/IncomeList";
import ImportStatementPage from "@features/import/ImportStatementPage";
import { ExpenseList } from "@features/expenses/components/ExpenseList";
import { SalaryList } from "@features/salary/components/SalaryList";
import { TdsQuarterly } from "@features/tds/components/TdsQuarterly";
import { StatementFormatList } from "@features/statement-formats/components/StatementFormatList";
import { IncomeCategoryList } from "@features/categories/components/IncomeCategoryList";
import { ExpenseCategoryList } from "@features/categories/components/ExpenseCategoryList";
import { incomeService } from "@api/services/incomeService";
import { salaryService } from "@api/services/salaryService";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
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

  const { data: incomesData } = useQuery({
    queryKey: ["dashboard-incomes"],
    queryFn: () => incomeService.getIncomes(),
    enabled: activeMenu === "Dashboard",
    staleTime: 5 * 60 * 1000,
  });

  const { data: salariesData } = useQuery({
    queryKey: ["dashboard-salaries"],
    queryFn: () => salaryService.getSalaries(),
    enabled: activeMenu === "Dashboard",
    staleTime: 5 * 60 * 1000,
  });

  const incomesRaw =
    (incomesData as any)?.data?.incomes ||
    (incomesData as any)?.incomes ||
    (incomesData as any)?.data ||
    incomesData ||
    [];
  const incomes = Array.isArray(incomesRaw) ? incomesRaw : [];

  const salariesRaw =
    (salariesData as any)?.data?.salaries ||
    (salariesData as any)?.salaries ||
    (salariesData as any)?.data ||
    salariesData ||
    [];
  const salaries = Array.isArray(salariesRaw) ? salariesRaw : [];

  const totalIncomeAmount = incomes.reduce((sum: number, income: any) => {
    return sum + Number(income.amount || 0);
  }, 0);

  const totalSalaryGrossAmount = salaries.reduce((sum: number, salary: any) => {
    return sum + Number(salary.gross_salary ?? salary.salary ?? 0);
  }, 0);

  const leftOutAmount = totalIncomeAmount - totalSalaryGrossAmount;
  const leftOutPercent = totalIncomeAmount > 0 ? (leftOutAmount / totalIncomeAmount) * 100 : 0;
  const leftOutPercentSafe = Number.isFinite(leftOutPercent) ? leftOutPercent : 0;

  const leftOutColorHex = leftOutPercentSafe <= 30
    ? "#16a34a"
    : leftOutPercentSafe <= 50
      ? "#d97706"
      : "#dc2626";

  const leftOutColorClass = leftOutPercentSafe <= 30
    ? "text-green-700 border-green-200 bg-green-50"
    : leftOutPercentSafe <= 50
      ? "text-amber-700 border-amber-200 bg-amber-50"
      : "text-red-700 border-red-200 bg-red-50";

  const salaryVsLeftOutData = useMemo(() => {
    if (totalIncomeAmount <= 0) {
      return [
        { name: "Salary", value: 0, color: "#0f766e" },
        { name: "Left Out", value: 0, color: leftOutColorHex },
      ];
    }

    const salaryWithinIncome = Math.max(0, Math.min(totalSalaryGrossAmount, totalIncomeAmount));
    const leftOutWithinIncome = Math.max(totalIncomeAmount - salaryWithinIncome, 0);

    return [
      { name: "Salary", value: salaryWithinIncome, color: "#0f766e" },
      { name: "Left Out", value: leftOutWithinIncome, color: leftOutColorHex },
    ];
  }, [totalIncomeAmount, totalSalaryGrossAmount, leftOutColorHex]);

  const formatMoney = (value: number) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const totalBalance = mockBankBalances.reduce((sum, bank) => sum + bank.balance, 0);
  const totalIncome = mockMonthlyData.reduce((sum, data) => sum + data.income, 0);
  const totalExpenses = mockExpenseCategories.reduce((sum, cat) => sum + cat.value, 0);
  const currentMonthIncome = mockMonthlyData[mockMonthlyData.length - 1]?.income || 0;
  const currentMonthExpense = mockMonthlyData[mockMonthlyData.length - 1]?.expense || 0;
  const savings = currentMonthIncome - currentMonthExpense;
  const savingsPercentage = ((savings / currentMonthIncome) * 100).toFixed(1);

  return (
    <div className={`bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 ${activeMenu === "Salary" ? "h-screen overflow-hidden" : "min-h-screen"}`}>
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

                {/* Import Statement */}
                <Button
                  size="sm"
                  variant={activeMenu === "Import" ? "default" : "ghost"}
                  onMouseEnter={() => setHoveredMenu("Import")}
                  onMouseLeave={() => setHoveredMenu(null)}
                  style={{
                    backgroundColor: activeMenu === "Import"
                      ? undefined
                      : hoveredMenu === "Import"
                        ? "#dcfce7"
                        : undefined
                  }}
                  className={activeMenu === "Import"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    : "text-green-700 transition-all"}
                  onClick={() => setActiveMenu("Import")}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                  Import
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
                    variant={["Accounts", "Employees", "Projects", "Groups", "StatementFormats"].includes(activeMenu) ? "default" : "ghost"}
                    style={{
                      backgroundColor: ["Accounts", "Employees", "Projects", "Groups", "StatementFormats"].includes(activeMenu)
                        ? undefined
                        : hoveredMenu === "Settings"
                          ? "#dcfce7"
                          : undefined
                    }}
                    className={["Accounts", "Employees", "Projects", "Groups", "StatementFormats"].includes(activeMenu)
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
                        <button
                          onMouseEnter={() => setHoveredItem("StatementFormats")}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            backgroundColor: hoveredItem === "StatementFormats" ? "#dcfce7" : "transparent"
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-green-700 flex items-center gap-2 transition-all cursor-pointer"
                          onClick={() => {
                            setActiveMenu("StatementFormats");
                            setIsSettingsOpen(false);
                          }}
                        >
                          <FileText className="w-4 h-4" />
                          Statement Format
                        </button>
                        <button
                          onMouseEnter={() => setHoveredItem("IncomeCategories")}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            backgroundColor: hoveredItem === "IncomeCategories" ? "#dcfce7" : "transparent"
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-green-700 flex items-center gap-2 transition-all cursor-pointer"
                          onClick={() => {
                            setActiveMenu("IncomeCategories");
                            setIsSettingsOpen(false);
                          }}
                        >
                          <Tag className="w-4 h-4" />
                          Income Category
                        </button>
                        <button
                          onMouseEnter={() => setHoveredItem("ExpenseCategories")}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            backgroundColor: hoveredItem === "ExpenseCategories" ? "#dcfce7" : "transparent"
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-green-700 flex items-center gap-2 transition-all cursor-pointer"
                          onClick={() => {
                            setActiveMenu("ExpenseCategories");
                            setIsSettingsOpen(false);
                          }}
                        >
                          <Tag className="w-4 h-4" />
                          Expense Category
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
      <main className={`max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 ${activeMenu !== "Dashboard" ? "h-[calc(100vh-4.5rem)] flex flex-col overflow-hidden pt-6" : "py-6"}`}>
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
        ) : activeMenu === "Salary" ? (
          <SalaryList />
        ) : activeMenu === "TDS" ? (
          <TdsQuarterly />
        ) : activeMenu === "StatementFormats" ? (
          <StatementFormatList />
        ) : activeMenu === "Import" ? (
          <ImportStatementPage />
        ) : activeMenu === "IncomeCategories" ? (
          <IncomeCategoryList />
        ) : activeMenu === "ExpenseCategories" ? (
          <ExpenseCategoryList />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <Card className="xl:col-span-9 border-green-100 bg-gradient-to-br from-white to-green-50/30 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-800 text-base flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    Income vs Salary
                  </CardTitle>
                  <CardDescription>Left out % = (Income - Salary Gross) / Income</CardDescription>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-green-100 bg-white px-3 py-2">
                        <p className="text-xs text-green-600">Total Income</p>
                        <p className="text-green-900">{formatMoney(totalIncomeAmount)}</p>
                      </div>
                      <div className="rounded-lg border border-green-100 bg-white px-3 py-2">
                        <p className="text-xs text-green-600">Total Salary (Gross)</p>
                        <p className="text-green-900">{formatMoney(totalSalaryGrossAmount)}</p>
                      </div>
                      <div className="rounded-lg border border-green-100 bg-white px-3 py-2 sm:col-span-2">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-green-600">Left Out Amount</p>
                            <p className={leftOutAmount >= 0 ? "text-green-900" : "text-red-700"}>
                              {formatMoney(leftOutAmount)}
                            </p>
                          </div>
                          <Badge variant="outline" className={leftOutColorClass}>
                            {leftOutPercentSafe <= 30
                              ? "Healthy (<=30%)"
                              : leftOutPercentSafe <= 50
                                ? "Watch (30-50%)"
                                : "High (>50%)"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="h-[170px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salaryVsLeftOutData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={40}
                            outerRadius={65}
                            paddingAngle={4}
                            stroke="none"
                          >
                            {salaryVsLeftOutData.map((entry, index) => (
                              <Cell key={`salary-leftout-top-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-[-100px] text-center pointer-events-none">
                        <p className="text-xs text-green-700">Left Out %</p>
                        <p className="text-2xl text-green-900">{leftOutPercentSafe.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="xl:col-span-3 border-green-100 bg-white shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card className="border-green-100 bg-gradient-to-br from-white to-green-50/30 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-green-600 mb-1">Total Balance</p>
                  <h3 className="text-green-800">{formatMoney(totalBalance)}</h3>
                  <p className="text-xs text-green-600 mt-1">Across all accounts</p>
                </CardContent>
              </Card>
              <Card className="border-green-100 bg-gradient-to-br from-white to-green-50/30 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-green-600 mb-1">Total Income</p>
                  <h3 className="text-green-800">{formatMoney(totalIncome)}</h3>
                  <p className="text-xs text-green-600 mt-1">YTD (mock trend)</p>
                </CardContent>
              </Card>
              <Card className="border-orange-100 bg-gradient-to-br from-white to-orange-50/30 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-orange-600 mb-1">Total Expense</p>
                  <h3 className="text-orange-800">{formatMoney(totalExpenses)}</h3>
                  <p className="text-xs text-orange-600 mt-1">Category aggregate</p>
                </CardContent>
              </Card>
              <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/30 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-blue-600 mb-1">Total Savings</p>
                  <h3 className="text-blue-800">{formatMoney(savings)}</h3>
                  <p className="text-xs text-blue-600 mt-1">{savingsPercentage}% this month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div className="xl:col-span-8 space-y-4">
                <CashflowChart data={mockMonthlyData} />
                <RecentTransactions transactions={mockRecentTransactions} />
              </div>

              <div className="xl:col-span-4 space-y-4">
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

                <Card className="border-green-100 bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-800 text-base">Expense Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
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
                          <span className="text-sm text-green-800">{formatMoney(category.value)}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

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
                        <span className="text-sm text-green-800">{formatMoney(bank.balance)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

