import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { DataTable, Column } from "./DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Plus, Pencil, Trash2, Search, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface Income {
  id: number;
  date: string;
  account: string;
  source: string;
  amount: number;
  description: string;
}

// Mock data
const mockIncomes: Income[] = [
  {
    id: 1,
    date: "2024-11-20",
    account: "HDFC Bank",
    source: "Salary",
    amount: 85000,
    description: "Monthly salary credit",
  },
  {
    id: 2,
    date: "2024-11-15",
    account: "ICICI Bank",
    source: "Freelance",
    amount: 35000,
    description: "Website development project",
  },
  {
    id: 3,
    date: "2024-11-10",
    account: "SBI",
    source: "Investment Returns",
    amount: 12500,
    description: "Mutual fund returns",
  },
  {
    id: 4,
    date: "2024-11-05",
    account: "HDFC Bank",
    source: "Consulting",
    amount: 25000,
    description: "Business consulting services",
  },
];

const availableAccounts = ["HDFC Bank", "ICICI Bank", "SBI", "Cash"];

const availableSources = [
  "Salary",
  "Freelance",
  "Consulting",
  "Investment Returns",
  "Business Income",
  "Rental Income",
  "Interest",
  "Other",
];

export function IncomeList() {
  const [incomes, setIncomes] = useState<Income[]>(mockIncomes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    account: "",
    source: "",
    amount: "",
    description: "",
  });

  const handleAddNew = () => {
    setEditingIncome(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      account: "",
      source: "",
      amount: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      date: income.date,
      account: income.account,
      source: income.source,
      amount: income.amount.toString(),
      description: income.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setIncomes((prev) => prev.filter((inc) => inc.id !== id));
  };

  const handleSave = () => {
    if (editingIncome) {
      // Update existing income
      setIncomes((prev) =>
        prev.map((inc) =>
          inc.id === editingIncome.id
            ? {
                ...inc,
                date: formData.date,
                account: formData.account,
                source: formData.source,
                amount: parseFloat(formData.amount),
                description: formData.description,
              }
            : inc
        )
      );
    } else {
      // Add new income
      const newIncome: Income = {
        id: Math.max(...incomes.map((i) => i.id), 0) + 1,
        date: formData.date,
        account: formData.account,
        source: formData.source,
        amount: parseFloat(formData.amount),
        description: formData.description,
      };
      setIncomes((prev) => [newIncome, ...prev]);
    }
    setIsDialogOpen(false);
  };

  const filteredIncomes = incomes.filter((inc) => {
    if (searchQuery === "") return true;
    return (
      inc.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.amount.toString().includes(searchQuery)
    );
  });

  const totalIncome = filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0);

  // Define table columns
  const columns: Column<Income>[] = [
    {
      header: "Date",
      accessor: (income) =>
        new Date(income.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      cellClassName: "text-green-700",
    },
    {
      header: "Account",
      accessor: "account",
      cellClassName: "text-green-800",
    },
    {
      header: "Source",
      accessor: (income) => (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          {income.source}
        </Badge>
      ),
    },
    {
      header: "Amount",
      accessor: (income) => `₹${income.amount.toLocaleString("en-IN")}`,
      cellClassName: "text-green-800",
    },
    {
      header: "Description",
      accessor: "description",
      cellClassName: "text-green-700 max-w-xs truncate",
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-green-800">Income</h1>
          <p className="text-sm text-green-600 mt-1">
            Track your income sources and earnings
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-green-600">Total Income</div>
          <div className="text-2xl text-green-800">
            ₹{totalIncome.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search income entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-green-200 focus:border-green-400 focus:ring-green-200"
          />
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Income Table - Takes remaining space */}
      <div className="flex-1 min-h-0">
        <DataTable
          data={filteredIncomes}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(income) => handleDelete(income.id)}
          emptyMessage="No income entries found"
          getRowKey={(income) => income.id}
          pageSize={10}
        />
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              {editingIncome ? "Edit Income" : "Add New Income"}
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              {editingIncome
                ? "Update income entry details below"
                : "Fill in the details to add a new income entry"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
              <Label htmlFor="date" className="text-green-800 flex items-center gap-1.5">
                Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left border-green-200 hover:bg-green-50 hover:border-green-300 h-11"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                    {formData.date ? (
                      format(new Date(formData.date), "PPP")
                    ) : (
                      <span className="text-green-500">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-green-200 shadow-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date ? new Date(formData.date) : undefined}
                    onSelect={(date) =>
                      setFormData({ ...formData, date: date ? format(date, "yyyy-MM-dd") : "" })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="account" className="text-green-800 flex items-center gap-1.5">
                Account <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.account}
                onValueChange={(value) =>
                  setFormData({ ...formData, account: value })
                }
              >
                <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {availableAccounts.map((account) => (
                    <SelectItem key={account} value={account}>
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="source" className="text-green-800 flex items-center gap-1.5">
                Source <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.source}
                onValueChange={(value) =>
                  setFormData({ ...formData, source: value })
                }
              >
                <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11">
                  <SelectValue placeholder="Select income source" />
                </SelectTrigger>
                <SelectContent>
                  {availableSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="amount" className="text-green-800 flex items-center gap-1.5">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="Enter amount"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
              />
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="description" className="text-green-800">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter description (optional)"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={
                !formData.date ||
                !formData.account ||
                !formData.source ||
                !formData.amount
              }
            >
              {editingIncome ? "Update Income" : "Add Income"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}