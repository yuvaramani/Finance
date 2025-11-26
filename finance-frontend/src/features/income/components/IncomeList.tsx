import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { StyledSelect } from "@components/StyledSelect";
import { DatePicker } from "@components/common/DatePicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { incomeService } from "@api/services/incomeService";
import { accountService } from "@api/services/accountService";
import { incomeSourceService } from "@api/services/incomeSourceService";
import { groupService } from "@api/services/groupService";
import { Grid, GridItem } from "@components/common/Grid";
import { DataTable, Column } from "@components/DataTable";

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const today = () => new Date().toISOString().slice(0, 10);

export function IncomeList() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [isLoadingIncome, setIsLoadingIncome] = useState(false);
  const [formData, setFormData] = useState({
    date: today(),
    account_id: "",
    source_id: "",
    amount: "",
    description: "",
  });

  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({
    group_id: "",
    name: "",
    balance: "0",
  });

  const [isAddSourceDialogOpen, setIsAddSourceDialogOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");

  const {
    data: incomesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["incomes", { search: searchQuery }],
    queryFn: () => incomeService.getIncomes({ search: searchQuery }),
    staleTime: 5 * 60 * 1000,
  });

  const incomesRaw =
    incomesData?.data?.incomes ||
    incomesData?.incomes ||
    incomesData?.data ||
    incomesData ||
    [];

  const incomes = Array.isArray(incomesRaw) ? incomesRaw : [];

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
    data: sourcesData,
    isLoading: isSourcesLoading,
    isError: isSourcesError,
  } = useQuery({
    queryKey: ["incomeSources"],
    queryFn: () => incomeSourceService.getSources(),
    staleTime: 10 * 60 * 1000,
  });

  const sourcesRaw =
    sourcesData?.data?.sources ||
    sourcesData?.sources ||
    sourcesData?.data ||
    sourcesData ||
    [];

  const sources = Array.isArray(sourcesRaw) ? sourcesRaw : [];

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

  const filteredIncomes = useMemo(() => {
    if (!searchQuery) return incomes;
    return incomes.filter((income: any) => {
      const accountMatch = income.account?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const sourceMatch = income.source?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const descMatch = income.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      return accountMatch || sourceMatch || descMatch;
    });
  }, [incomes, searchQuery]);

  const createMutation = useMutation({
    mutationFn: (payload: any) => incomeService.createIncome(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      enqueueSnackbar("Income added successfully", { variant: "success" });
      resetDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to add income", { variant: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      incomeService.updateIncome(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      enqueueSnackbar("Income updated successfully", { variant: "success" });
      resetDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to update income", { variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => incomeService.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      enqueueSnackbar("Income deleted successfully", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to delete income", { variant: "error" });
    },
  });

  const addAccountMutation = useMutation({
    mutationFn: (payload: any) => accountService.createAccount(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["accounts", "dropdown"] });
      enqueueSnackbar("Account created", { variant: "success" });
      const created =
        data?.data?.account ||
        data?.account ||
        data;
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

  const addSourceMutation = useMutation({
    mutationFn: (payload: { name: string }) => incomeSourceService.createSource(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["incomeSources"] });
      enqueueSnackbar("Source created", { variant: "success" });
      const created =
        data?.data?.source ||
        data?.source ||
        data;
      if (created?.id) {
        setFormData((prev) => ({
          ...prev,
          source_id: created.id.toString(),
        }));
      }
      setNewSourceName("");
      setIsAddSourceDialogOpen(false);
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to add source", { variant: "error" });
    },
  });

  const handleAddNew = () => {
    setEditingIncome(null);
    setFormData({
      date: today(),
      account_id: "",
      source_id: "",
      amount: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = async (income: any) => {
    setIsLoadingIncome(true);
    setIsDialogOpen(true);
    
    try {
      // Fetch fresh income data from the API
      const response = await incomeService.getIncome(income.id);
      const freshIncomeData = response?.data?.income || response?.income || response;
      
      setEditingIncome(freshIncomeData);
      setFormData({
        date: freshIncomeData.date || today(),
        account_id: freshIncomeData.account?.id?.toString() || "",
        source_id: freshIncomeData.source?.id?.toString() || "",
        amount: freshIncomeData.amount?.toString() || "",
        description: freshIncomeData.description || "",
      });
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Failed to load income data", { variant: "error" });
      setIsDialogOpen(false);
    } finally {
      setIsLoadingIncome(false);
    }
  };

  const handleDelete = (income: any) => {
    if (window.confirm("Delete this income entry?")) {
      deleteMutation.mutate(income.id);
    }
  };

  const handleSave = () => {
    const payload = {
      date: formData.date,
      account_id: Number(formData.account_id),
      source_id: Number(formData.source_id),
      amount: Number(formData.amount || 0),
      description: formData.description || null,
    };

    if (editingIncome) {
      updateMutation.mutate({ id: editingIncome.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditingIncome(null);
    setFormData({
      date: today(),
      account_id: "",
      source_id: "",
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
      accessor: (income) => income.account?.name || "—",
      cellClassName: "text-green-700",
    },
    {
      header: "Source",
      accessor: (income) => income.source?.name || "—",
      cellClassName: "text-green-700",
    },
    {
      header: "Amount",
      accessor: (income) => (
        <span className="text-green-700 font-semibold">
          {formatCurrency(income.amount)}
        </span>
      ),
    },
    {
      header: "Description",
      accessor: (income) => income.description || "—",
      cellClassName: "text-green-700",
    },
  ];

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-green-800">Income</h1>
          <p className="text-sm text-green-600 mt-1">
            Track every income entry with account and source breakdown
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <Input
            placeholder="Search by account, source or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
          />
        </div>
        <Button
          onClick={handleAddNew}
          size="icon"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 w-10"
          title="Add Income"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full border border-green-100 rounded flex items-center justify-center">
            <div className="flex items-center gap-3 text-green-700">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              <span>Loading incomes...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="h-full border border-red-200 rounded bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error loading incomes</p>
            <p className="text-sm mt-1">{(error as any)?.message || "Please try again."}</p>
          </div>
        ) : (
          <DataTable
            data={filteredIncomes}
            columns={columns}
            getRowKey={(income) => income.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowDoubleClick={handleEdit}
            emptyMessage="No income records found"
          />
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[620px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              {editingIncome ? "Edit Income" : "Add Income"}
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              {editingIncome
                ? "Update the selected record"
                : "Fill in the details to record a new income"}
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
                Source <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <StyledSelect
                  value={formData.source_id}
                  onChange={(value) => setFormData({ ...formData, source_id: value })}
                  placeholder="- Select -"
                  disabled={isSourcesLoading || isSourcesError}
                  options={sources.map((source: any) => ({
                    value: source.id?.toString(),
                    label: source.name,
                  }))}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 border-green-200 text-green-700 hover:bg-green-50 flex-shrink-0"
                  onClick={() => setIsAddSourceDialogOpen(true)}
                  disabled={addSourceMutation.isPending}
                  title="Add Source"
                >
                  {addSourceMutation.isPending ? (
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
                !formData.source_id ||
                !formData.amount
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingIncome ? (
                "Update Income"
              ) : (
                "Add Income"
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
              Create a new account to use for income entries
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

      <Dialog open={isAddSourceDialogOpen} onOpenChange={setIsAddSourceDialogOpen}>
        <DialogContent className="sm:max-w-[420px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">Add Source</DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Create a new income source on the fly
            </DialogDescription>
          </DialogHeader>
          <Grid>
            <GridItem>
              <Label className="text-green-800 flex items-center gap-1.5">
                Source Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                placeholder="Consulting, Rent, etc."
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
              />
            </GridItem>
          </Grid>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddSourceDialogOpen(false)}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={addSourceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => addSourceMutation.mutate({ name: newSourceName.trim() })}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={!newSourceName.trim() || addSourceMutation.isPending}
            >
              {addSourceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Source"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

