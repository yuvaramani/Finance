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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Copy,
  Sparkles,
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
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [initialFormSnapshot, setInitialFormSnapshot] = useState<any>(null);
  const [initialBulkSnapshot, setInitialBulkSnapshot] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("description");
  const [filterValue, setFilterValue] = useState("");
  const [activeFilter, setActiveFilter] = useState({ type: "description", value: "" });
  const [formData, setFormData] = useState({
    date: today(),
    account_id: "",
    source_id: "",
    amount: "",
    description: "",
  });

  const createBulkRow = (overrides: Partial<any> = {}) => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: today(),
    account_id: "",
    source_id: "",
    amount: "",
    description: "",
    ...overrides,
  });

  const [bulkRows, setBulkRows] = useState<any[]>([createBulkRow()]);
  const [quickEntryRowId, setQuickEntryRowId] = useState<string | null>(null);
  const [quickEntryText, setQuickEntryText] = useState("");

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
    queryKey: ["incomes", activeFilter],
    queryFn: () => {
      const params: any = {};
      if (activeFilter.value) {
        if (activeFilter.type === 'description') params.search = activeFilter.value;
        if (activeFilter.type === 'date') params.date = activeFilter.value;
        if (activeFilter.type === 'account') params.account_id = activeFilter.value;
        if (activeFilter.type === 'source') params.source_id = activeFilter.value;
        if (activeFilter.type === 'amount') params.amount = activeFilter.value;
      }
      return incomeService.getIncomes(params);
    },
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
    queryFn: () => incomeSourceService.getIncomeSources(),
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
    return incomes;
  }, [incomes]);

  const filteredTotal = useMemo(() => {
    return filteredIncomes.reduce((sum: number, income: any) => {
      const val = Number(income?.amount || 0);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);
  }, [filteredIncomes]);

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

  const createBulkMutation = useMutation({
    mutationFn: async (rows: any[]) => {
      const payloads = rows.map((row) => ({
        date: row.date,
        account_id: Number(row.account_id),
        source_id: Number(row.source_id),
        amount: Number(row.amount || 0),
        description: row.description || null,
      }));
      const promises = payloads.map((payload) => incomeService.createIncome(payload));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      enqueueSnackbar("Bulk income entries created successfully", { variant: "success" });
      setIsBulkDialogOpen(false);
      setBulkRows([createBulkRow()]);
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to create bulk income entries", { variant: "error" });
    },
  });

  const addAccountMutation = useMutation({
    mutationFn: (payload: any) => accountService.createAccount(payload),
    onSuccess: (data: any) => {
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
    mutationFn: (payload: { name: string }) => incomeSourceService.createIncomeSource(payload),
    onSuccess: (data: any) => {
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
    const initial = {
      date: today(),
      account_id: "",
      source_id: "",
      amount: "",
      description: "",
    };
    setFormData(initial);
    setInitialFormSnapshot(initial);
    setIsDialogOpen(true);
  };

  const handleAddBulk = () => {
    const initialRows = [createBulkRow()];
    setIsBulkDialogOpen(true);
    setBulkRows(initialRows);
    setInitialBulkSnapshot(initialRows.map(({ id, ...rest }) => rest));
  };

  const handleEdit = async (income: any) => {
    setIsLoadingIncome(true);
    setIsDialogOpen(true);

    try {
      // Fetch fresh income data from the API
      const response = await incomeService.getIncome(income.id);
      const freshIncomeData = response?.data?.income || response?.income || response;

      setEditingIncome(freshIncomeData);
      const initial = {
        date: freshIncomeData.date || today(),
        account_id: freshIncomeData.account?.id?.toString() || "",
        source_id: freshIncomeData.source?.id?.toString() || "",
        amount: freshIncomeData.amount?.toString() || "",
        description: freshIncomeData.description || "",
      };
      setFormData(initial);
      setInitialFormSnapshot(initial);
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
    const initial = {
      date: today(),
      account_id: "",
      source_id: "",
      amount: "",
      description: "",
    };
    setFormData(initial);
    setInitialFormSnapshot(initial);
  };

  const resetBulkDialog = () => {
    setIsBulkDialogOpen(false);
    const initialRows = [createBulkRow()];
    setBulkRows(initialRows);
    setInitialBulkSnapshot(initialRows.map(({ id, ...rest }) => rest));
  };

  const isSingleDirty = () => {
    if (!initialFormSnapshot) return false;
    return (
      initialFormSnapshot.date !== formData.date ||
      initialFormSnapshot.account_id !== formData.account_id ||
      initialFormSnapshot.source_id !== formData.source_id ||
      initialFormSnapshot.amount !== formData.amount ||
      initialFormSnapshot.description !== formData.description
    );
  };

  const isBulkDirty = () => {
    const current = bulkRows.map(({ id, ...rest }) => rest);
    if (current.length !== initialBulkSnapshot.length) return true;
    for (let i = 0; i < current.length; i += 1) {
      const cur = current[i];
      const init = initialBulkSnapshot[i] || {};
      if (
        cur.date !== init.date ||
        cur.account_id !== init.account_id ||
        cur.source_id !== init.source_id ||
        cur.amount !== init.amount ||
        cur.description !== init.description
      ) {
        return true;
      }
    }
    return false;
  };

  const handleSingleDialogChange = (open: boolean) => {
    if (!open) {
      if (isSingleDirty() && !window.confirm("Discard changes?")) {
        return;
      }
      resetDialog();
      return;
    }
    setIsDialogOpen(true);
  };

  const handleBulkDialogChange = (open: boolean) => {
    if (!open) {
      if (isBulkDirty() && !window.confirm("Discard changes?")) {
        return;
      }
      resetBulkDialog();
      return;
    }
    setIsBulkDialogOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || createBulkMutation.isPending;

  const updateBulkRow = (id: string, patch: Partial<any>) => {
    setBulkRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const handleBulkAddRow = () => {
    const last = bulkRows[bulkRows.length - 1];
    setBulkRows((prev) => [
      ...prev,
      createBulkRow({
        account_id: last?.account_id || "",
        source_id: last?.source_id || "",
        date: last?.date || today(),
      }),
    ]);
  };

  const handleBulkDuplicateRow = (row: any) => {
    setBulkRows((prev) => {
      const index = prev.findIndex((r) => r.id === row.id);
      const copy = createBulkRow({
        date: row.date,
        account_id: row.account_id,
        source_id: row.source_id,
        amount: row.amount,
        description: row.description,
      });
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const handleBulkRemoveRow = (id: string) => {
    setBulkRows((prev) => {
      if (prev.length === 1) {
        return [createBulkRow()];
      }
      return prev.filter((row) => row.id !== id);
    });
  };

  const handleBulkSave = () => {
    const invalidIndexes = bulkRows
      .map((row, idx) => ({ row, idx }))
      .filter(({ row }) => !row.date || !row.account_id || !row.source_id || !row.amount);

    if (invalidIndexes.length > 0) {
      const rowNumbers = invalidIndexes.map((x) => x.idx + 1).join(", ");
      enqueueSnackbar(`Please fill required fields in row(s): ${rowNumbers}`, { variant: "error" });
      return;
    }

    createBulkMutation.mutate(bulkRows);
  };

  const parseQuickEntry = (input: string) => {
    const parts = input.split("~").map((p) => p.trim());
    if (parts.length < 3) {
      return { error: "Please use format: date~amount~description" };
    }
    const [datePart, amountPart, ...descParts] = parts;
    const desc = descParts.join("~").trim();

    const dateMatch = datePart.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dateMatch) {
      return { error: "Date must be in DD/MM/YYYY format" };
    }
    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const year = Number(dateMatch[3]);
    if (!day || !month || !year || day > 31 || month > 12) {
      return { error: "Invalid date in quick entry" };
    }
    const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const amountStr = amountPart.replace(/[,₹\s]/g, "");
    const amountNum = Number(amountStr);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return { error: "Invalid amount in quick entry" };
    }

    return {
      date: isoDate,
      amount: amountStr,
      description: desc,
    };
  };

  const handleQuickEntryApply = (rowId: string) => {
    const parsed = parseQuickEntry(quickEntryText);
    if ((parsed as any).error) {
      enqueueSnackbar((parsed as any).error, { variant: "error" });
      return;
    }
    updateBulkRow(rowId, {
      date: (parsed as any).date,
      amount: (parsed as any).amount,
      description: (parsed as any).description,
    });
    setQuickEntryText("");
    setQuickEntryRowId(null);
  };

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

  const handleFilter = () => {
    setActiveFilter({ type: filterType, value: filterValue });
  };

  const clearFilter = () => {
    setFilterValue("");
    setActiveFilter({ type: "description", value: "" });
  };

  return (
    <div className="flex flex-col h-full w-full flex-1 gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-green-800">Income</h1>
          <p className="text-sm text-green-600 mt-1">
            Track every income entry with account and source breakdown
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-green-100 p-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterValue("");
            }}
            className="h-10 w-[150px] bg-gray-50 border border-green-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-green-400 focus:border-transparent px-2 text-green-800 outline-none"
          >
            <option value="description">Description (Search)</option>
            <option value="date">Date</option>
            <option value="account">Account</option>
            <option value="source">Income Source</option>
            <option value="amount">Amount</option>
          </select>

          <div className="flex-1 max-w-[400px]">
            {filterType === 'description' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                <Input
                  placeholder="Search description..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="pl-9 h-10 border-green-200 focus:border-green-400 focus:ring-green-400 w-full"
                />
              </div>
            )}
            {filterType === 'date' && (
              <Input
                type="date"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="h-10 border-green-200 focus:border-green-400 focus:ring-green-400 w-full"
              />
            )}
            {filterType === 'account' && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="h-10 w-full bg-white border border-green-200 rounded-md text-sm focus:ring-2 focus:ring-green-400 px-3 outline-none"
              >
                <option value="">Select Account</option>
                {accounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            )}
            {filterType === 'source' && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="h-10 w-full bg-white border border-green-200 rounded-md text-sm focus:ring-2 focus:ring-green-400 px-3 outline-none"
              >
                <option value="">Select Source</option>
                {sources.map((src: any) => (
                  <option key={src.id} value={src.id}>{src.name}</option>
                ))}
              </select>
            )}
            {filterType === 'amount' && (
              <Input
                type="number"
                placeholder="Enter amount..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="h-10 border-green-200 focus:border-green-400 focus:ring-green-400 w-full"
              />
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleFilter}
            className="h-10 w-10 text-green-600 hover:bg-green-50"
            title="Apply Filter"
          >
            <Search className="h-5 w-5" />
          </Button>

          {(activeFilter.value || filterValue) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilter}
              className="h-10 w-10 text-gray-400 hover:text-red-500 hover:bg-red-50"
              title="Clear Filter"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="text-green-800 font-semibold px-3">
          Total: {formatCurrency(filteredTotal)}
        </div>

        <Button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md h-10 px-4"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Income
        </Button>
        <Button
          onClick={handleAddBulk}
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-50 h-10 px-4"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Bulk Income
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

      <Dialog open={isDialogOpen} onOpenChange={handleSingleDialogChange}>
        <DialogContent
          className="sm:max-w-[620px] bg-white border-green-200 shadow-xl rounded-sm"
        >
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
              onClick={() => handleSingleDialogChange(false)}
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

      <Dialog open={isBulkDialogOpen} onOpenChange={handleBulkDialogChange}>
        <DialogContent
          className="sm:max-w-[1050px] bg-white border-green-200 shadow-xl rounded-lg"
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-green-800 text-xl">Add Bulk Income</DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Enter multiple income rows and save in one go
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 max-h-[560px] overflow-auto">
            <div className="border border-green-300 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-100">
                    <th className="border-r border-green-200 p-2.5 text-green-800 text-left w-[160px]">Date *</th>
                    <th className="border-r border-green-200 p-2.5 text-green-800 text-left w-[220px]">Account *</th>
                    <th className="border-r border-green-200 p-2.5 text-green-800 text-left w-[220px]">Source *</th>
                    <th className="border-r border-green-200 p-2.5 text-green-800 text-right w-[160px]">Amount *</th>
                    <th className="border-r border-green-200 p-2.5 text-green-800 text-left">Description</th>
                    <th className="p-2.5 text-green-800 text-center w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bulkRows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-green-100 hover:bg-green-50/30 transition-colors">
                      <td className="border-r border-green-100 p-1">
                        <Input
                          type="date"
                          value={row.date}
                          onChange={(e) => updateBulkRow(row.id, { date: e.target.value })}
                          className="h-9 border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                      </td>
                      <td className="border-r border-green-100 p-1">
                        <StyledSelect
                          value={row.account_id}
                          onChange={(value) => updateBulkRow(row.id, { account_id: value })}
                          placeholder="- Select -"
                          disabled={isAccountsLoading || isAccountsError}
                          options={accounts.map((account: any) => ({
                            value: account.id?.toString(),
                            label: account.name,
                          }))}
                          className="w-full"
                        />
                      </td>
                      <td className="border-r border-green-100 p-1">
                        <StyledSelect
                          value={row.source_id}
                          onChange={(value) => updateBulkRow(row.id, { source_id: value })}
                          placeholder="- Select -"
                          disabled={isSourcesLoading || isSourcesError}
                          options={sources.map((source: any) => ({
                            value: source.id?.toString(),
                            label: source.name,
                          }))}
                          className="w-full"
                        />
                      </td>
                      <td className="border-r border-green-100 p-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.amount}
                          onChange={(e) => updateBulkRow(row.id, { amount: e.target.value })}
                          placeholder="0.00"
                          className="h-9 border-green-200 focus:border-green-400 focus:ring-green-400 text-right"
                        />
                      </td>
                      <td className="border-r border-green-100 p-1">
                        <Input
                          value={row.description}
                          onChange={(e) => updateBulkRow(row.id, { description: e.target.value })}
                          placeholder="Notes"
                          className="h-9 border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Popover open={quickEntryRowId === row.id} onOpenChange={(open) => {
                            setQuickEntryRowId(open ? row.id : null);
                            if (!open) {
                              setQuickEntryText("");
                            }
                          }}>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-green-200 text-green-700 hover:bg-green-50"
                                title="Quick entry"
                              >
                                <Sparkles className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[360px] p-3" align="end">
                              <div className="flex flex-col gap-2">
                                <Label className="text-green-800 text-sm">Quick Entry</Label>
                                <Input
                                  value={quickEntryText}
                                  onChange={(e) => setQuickEntryText(e.target.value)}
                                  placeholder="DD/MM/YYYY~amount~description"
                                  className="border-green-200 focus:border-green-400 focus:ring-green-400 h-9"
                                  autoFocus
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-green-600">
                                    Example: 16/04/2025~770868~GRS/0016...
                                  </span>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="border-green-200 text-green-700 hover:bg-green-50"
                                      onClick={() => {
                                        setQuickEntryRowId(null);
                                        setQuickEntryText("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleQuickEntryApply(row.id)}
                                    >
                                      OK
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => handleBulkDuplicateRow(row)}
                            title="Duplicate row"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleBulkRemoveRow(row.id)}
                            title="Remove row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
              onClick={handleBulkAddRow}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
            <div className="text-xs text-green-600">
              Rows: {bulkRows.length}
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => handleBulkDialogChange(false)}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkSave}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={isSaving || bulkRows.length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save All"
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
