import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { StyledSelect } from "@components/StyledSelect";
import { DatePicker } from "@components/common/DatePicker";
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { expenseService } from "@api/services/expenseService";
import { accountService } from "@api/services/accountService";
import { groupService } from "@api/services/groupService";
import { expenseCategoryService } from "@api/services/expenseCategoryService";
import { Grid, GridItem } from "@components/common/Grid";
import { DataTable, Column } from "@components/DataTable";

const today = () => new Date().toISOString().slice(0, 10);

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function ExpenseList() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isLoadingExpense, setIsLoadingExpense] = useState(false);
  const [formData, setFormData] = useState({
    date: today(),
    account_id: "",
    category_id: "",
    amount: "",
    description: "",
  });

  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({
    group_id: "",
    name: "",
    balance: "0",
  });

  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const {
    data: expensesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["expenses", { search: searchQuery }],
    queryFn: () => expenseService.getExpenses({ search: searchQuery }),
    staleTime: 5 * 60 * 1000,
  });

  const expensesRaw =
    expensesData?.data?.expenses ||
    expensesData?.expenses ||
    expensesData?.data ||
    expensesData ||
    [];

  const expenses = Array.isArray(expensesRaw) ? expensesRaw : [];

  const {
    data: accountsData,
    isLoading: isAccountsLoading,
    isError: isAccountsError,
  } = useQuery({
    queryKey: ["accounts", "dropdown"],
    queryFn: () => accountService.getAccounts({ per_page: 500 }),
    staleTime: 10 * 60 * 1000,
  });

  const accountsRaw =
    accountsData?.data?.accounts ||
    accountsData?.accounts ||
    accountsData?.data ||
    accountsData ||
    [];

  const accounts = Array.isArray(accountsRaw)
    ? accountsRaw
    : Array.isArray(accountsRaw?.data)
      ? accountsRaw.data
      : [];

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["expenseCategories"],
    queryFn: () => expenseCategoryService.getCategories(),
    staleTime: 10 * 60 * 1000,
  });

  const categoriesRaw =
    categoriesData?.data?.categories ||
    categoriesData?.categories ||
    categoriesData?.data ||
    categoriesData ||
    [];

  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];

  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    isError: isGroupsError,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupService.getGroups(),
    staleTime: 10 * 60 * 1000,
  });

  const groupsRaw =
    groupsData?.data?.groups ||
    groupsData?.groups ||
    groupsData?.data ||
    groupsData ||
    [];

  const groups = Array.isArray(groupsRaw) ? groupsRaw : [];

  const filteredExpenses = useMemo(() => {
    if (!searchQuery) return expenses;
    return expenses.filter((expense: any) => {
      const accountMatch = expense.account?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const categoryMatch = expense.category?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const descMatch = expense.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      return accountMatch || categoryMatch || descMatch;
    });
  }, [expenses, searchQuery]);

  const createMutation = useMutation({
    mutationFn: (payload: any) => expenseService.createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      enqueueSnackbar("Expense added successfully", { variant: "success" });
      resetDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to add expense", { variant: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      expenseService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      enqueueSnackbar("Expense updated successfully", { variant: "success" });
      resetDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to update expense", { variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      enqueueSnackbar("Expense deleted successfully", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to delete expense", { variant: "error" });
    },
  });

  const addAccountMutation = useMutation({
    mutationFn: (payload: any) => accountService.createAccount(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["accounts", "dropdown"] });
      enqueueSnackbar("Account created", { variant: "success" });
      const created = data?.data?.account || data?.account || data;
      if (created?.id) {
        setFormData((prev) => ({
          ...prev,
          account_id: created.id.toString(),
        }));
      }
      setAccountForm({
        group_id: "",
        name: "",
        balance: "0",
      });
      setIsAddAccountDialogOpen(false);
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to add account", { variant: "error" });
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: (payload: { name: string }) => expenseCategoryService.createCategory(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      enqueueSnackbar("Category created", { variant: "success" });
      const created = data?.data?.category || data?.category || data;
      if (created?.id) {
        setFormData((prev) => ({
          ...prev,
          category_id: created.id.toString(),
        }));
      }
      setNewCategoryName("");
      setIsAddCategoryDialogOpen(false);
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to add category", { variant: "error" });
    },
  });

  const handleAddNew = () => {
    setEditingExpense(null);
    setFormData({
      date: today(),
      account_id: "",
      category_id: "",
      amount: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = async (expense: any) => {
    setIsLoadingExpense(true);
    setIsDialogOpen(true);
    
    try {
      // Fetch fresh expense data from the API
      const response = await expenseService.getExpense(expense.id);
      const freshExpenseData = response?.data?.expense || response?.expense || response;
      
      setEditingExpense(freshExpenseData);
      setFormData({
        date: freshExpenseData.date || today(),
        account_id: freshExpenseData.account?.id?.toString() || "",
        category_id: freshExpenseData.category?.id?.toString() || "",
        amount: freshExpenseData.amount?.toString() || "",
        description: freshExpenseData.description || "",
      });
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Failed to load expense data", { variant: "error" });
      setIsDialogOpen(false);
    } finally {
      setIsLoadingExpense(false);
    }
  };

  const handleDelete = (expense: any) => {
    if (window.confirm("Delete this expense entry?")) {
      deleteMutation.mutate(expense.id);
    }
  };

  const handleSave = () => {
    const payload = {
      date: formData.date,
      account_id: Number(formData.account_id),
      category_id: Number(formData.category_id),
      amount: Number(formData.amount || 0),
      description: formData.description || null,
    };

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
    setFormData({
      date: today(),
      account_id: "",
      category_id: "",
      amount: "",
      description: "",
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const columns: Column<any>[] = [
    {
      header: "Date",
      accessor: "date",
      cellClassName: "text-green-800",
    },
    {
      header: "Account",
      accessor: (expense) => expense.account?.name || "—",
      cellClassName: "text-green-700",
    },
    {
      header: "Category",
      accessor: (expense) => expense.category?.name || "—",
      cellClassName: "text-green-700",
    },
    {
      header: "Amount",
      accessor: (expense) => (
        <span className="text-green-700 font-semibold">
          {formatCurrency(expense.amount)}
        </span>
      ),
    },
    {
      header: "Description",
      accessor: (expense) => expense.description || "—",
      cellClassName: "text-green-700",
    },
  ];

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-green-800">Expenses</h1>
          <p className="text-sm text-green-600 mt-1">
            Capture outgoing payments with account & category mapping
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <Input
            placeholder="Search by account, category or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
          />
        </div>
        <Button
          onClick={handleAddNew}
          size="icon"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 w-10"
          title="Add Expense"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full border border-green-100 rounded flex items-center justify-center">
            <div className="flex items-center gap-3 text-green-700">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              <span>Loading expenses...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="h-full border border-red-200 rounded bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error loading expenses</p>
            <p className="text-sm mt-1">{(error as any)?.message || "Please try again."}</p>
          </div>
        ) : (
          <DataTable
            data={filteredExpenses}
            columns={columns}
            getRowKey={(expense) => expense.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowDoubleClick={handleEdit}
            emptyMessage="No expenses found"
          />
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[620px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              {editingExpense
                ? "Update the selected record"
                : "Fill in the details to record a new expense"}
            </DialogDescription>
          </DialogHeader>

          <Grid>
            <GridItem>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date: date || today() })}
                placeholder="Select date"
                required
              />
            </GridItem>

            <GridItem>
              <Label className="text-green-800 flex items-center gap-1.5">
                Account <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <StyledSelect
                  value={formData.account_id}
                  onChange={(value) => setFormData({ ...formData, account_id: value })}
                  placeholder="- Select -"
                  disabled={isAccountsLoading || isAccountsError}
                  options={accounts.map((account: any) => ({
                    value: account.id?.toString(),
                    label: account.name,
                  }))}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 border-green-200 text-green-700 hover:bg-green-50 flex-shrink-0"
                  onClick={() => setIsAddAccountDialogOpen(true)}
                  disabled={addAccountMutation.isPending}
                  title="Add Account"
                >
                  {addAccountMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </GridItem>

            <GridItem>
              <Label className="text-green-800 flex items-center gap-1.5">
                Category <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <StyledSelect
                  value={formData.category_id}
                  onChange={(value) => setFormData({ ...formData, category_id: value })}
                  placeholder="- Select -"
                  disabled={isCategoriesLoading || isCategoriesError}
                  options={categories.map((category: any) => ({
                    value: category.id?.toString(),
                    label: category.name,
                  }))}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 border-green-200 text-green-700 hover:bg-green-50 flex-shrink-0"
                  onClick={() => setIsAddCategoryDialogOpen(true)}
                  disabled={addCategoryMutation.isPending}
                  title="Add Category"
                >
                  {addCategoryMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </GridItem>

            <GridItem>
              <Label className="text-green-800 flex items-center gap-1.5">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
              />
            </GridItem>

            <GridItem>
              <Label className="text-green-800">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add any notes"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 min-h-[100px]"
              />
            </GridItem>
          </Grid>

          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={resetDialog}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={
                isSaving ||
                !formData.date ||
                !formData.account_id ||
                !formData.category_id ||
                !formData.amount
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingExpense ? (
                "Update Expense"
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddAccountDialogOpen} onOpenChange={setIsAddAccountDialogOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">Add Account</DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Create a new account to use for expenses
            </DialogDescription>
          </DialogHeader>
          <Grid>
            <GridItem>
              <Label className="text-green-800 flex items-center gap-1.5">
                Group <span className="text-red-500">*</span>
              </Label>
              <StyledSelect
                value={accountForm.group_id}
                onChange={(value) => setAccountForm({ ...accountForm, group_id: value })}
                placeholder="- Select -"
                disabled={isGroupsLoading || isGroupsError}
                options={groups.map((group: any) => ({
                  value: group.id?.toString(),
                  label: group.name,
                }))}
              />
            </GridItem>
            <GridItem>
              <Label className="text-green-800 flex items-center gap-1.5">
                Account Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                placeholder="For ex: HDFC Bank"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
              />
            </GridItem>
            <GridItem>
              <Label className="text-green-800">Opening Balance</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={accountForm.balance}
                onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                placeholder="0.00"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
              />
            </GridItem>
          </Grid>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddAccountDialogOpen(false)}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={addAccountMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                addAccountMutation.mutate({
                  group_id: Number(accountForm.group_id),
                  name: accountForm.name,
                  status: "Active",
                  balance: Number(accountForm.balance || 0),
                })
              }
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={
                addAccountMutation.isPending ||
                !accountForm.group_id ||
                !accountForm.name.trim()
              }
            >
              {addAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[420px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">Add Category</DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Create a new expense category
            </DialogDescription>
          </DialogHeader>
          <Grid>
            <GridItem>
              <Label className="text-green-800 flex items-center gap-1.5">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Rent, Software, Utilities..."
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
              />
            </GridItem>
          </Grid>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddCategoryDialogOpen(false)}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={addCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => addCategoryMutation.mutate({ name: newCategoryName.trim() })}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={!newCategoryName.trim() || addCategoryMutation.isPending}
            >
              {addCategoryMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

