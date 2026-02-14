import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Checkbox } from "@components/ui/checkbox";
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
  Filter,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import { salaryService } from "@api/services/salaryService";
import { employeeService } from "@api/services/employeeService";
import { accountService } from "@api/services/accountService";
import { projectService } from "@api/services/projectService";
import { groupService } from "@api/services/groupService";
import { Grid, GridItem } from "@components/common/Grid";
import { DataTable, Column } from "@components/DataTable";

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const today = () => new Date().toISOString().slice(0, 10);

export function SalaryList() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isIndividualDialogOpen, setIsIndividualDialogOpen] = useState(false);
  const [isBatchStep1DialogOpen, setIsBatchStep1DialogOpen] = useState(false);
  const [isBatchStep2DialogOpen, setIsBatchStep2DialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<any>(null);
  const [isLoadingSalary, setIsLoadingSalary] = useState(false);
  
  // Individual form data
  const [individualFormData, setIndividualFormData] = useState({
    date: today(),
    employee_id: "",
    account_id: "",
    net_salary: "",
    tds: "0",
    gross_salary: "0",
  });

  // Batch form data
  const [batchStep1Data, setBatchStep1Data] = useState({
    project_id: "",
    date: today(),
    account_id: "",
  });

  const [batchStep2Data, setBatchStep2Data] = useState<Record<number, { selected: boolean; net_salary: string; tds: string; gross_salary: string }>>({});

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importAccountId, setImportAccountId] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Add account dialog state
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({
    group_id: "",
    name: "",
    balance: "0",
  });

  // Fetch salaries with date filters
  const {
    data: salariesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["salaries", { from_date: fromDate, to_date: toDate, employee_id: employeeFilter }],
    queryFn: () => salaryService.getSalaries({ 
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      employee_id: employeeFilter || undefined,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const salariesRaw =
    salariesData?.data?.salaries ||
    salariesData?.salaries ||
    salariesData?.data ||
    salariesData ||
    [];

  const salaries = Array.isArray(salariesRaw) ? salariesRaw : [];

  const totalSalary = salaries.reduce((sum: number, salary: any) => {
    const gross = Number(salary.gross_salary ?? salary.salary ?? 0);
    return sum + (gross || 0);
  }, 0);

  // Fetch employees
  const {
    data: employeesData,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
  } = useQuery({
    queryKey: ["employees", "dropdown"],
    queryFn: () => employeeService.getEmployees({ status: "active", per_page: 500 }),
    staleTime: 10 * 60 * 1000,
  });

  const employeesRaw =
    employeesData?.data?.employees ||
    employeesData?.employees ||
    employeesData?.data ||
    employeesData ||
    [];

  const employees = Array.isArray(employeesRaw) ? employeesRaw : [];

  // Fetch accounts
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

  // Fetch groups for add account dialog
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

  // Fetch projects
  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectService.getProjects({ status: "active", per_page: 1000 }),
    staleTime: 10 * 60 * 1000,
  });

  const projectsRaw =
    projectsData?.data?.projects ||
    projectsData?.projects ||
    projectsData?.data ||
    projectsData ||
    [];

  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];

  // Get employees for batch (filtered by project)
  const batchEmployees = useMemo(() => {
    if (!batchStep1Data.project_id) return [];
    const projectId = batchStep1Data.project_id;
    return employees.filter((emp: any) => {
      const empProjects = emp.projects || emp.project_ids || [];
      // Handle different formats: array, comma-separated string, or JSON string
      let projectIds: string[] = [];
      if (Array.isArray(empProjects)) {
        projectIds = empProjects.map((p: any) => String(p));
      } else if (typeof empProjects === 'string') {
        try {
          const parsed = JSON.parse(empProjects);
          projectIds = Array.isArray(parsed) ? parsed.map((p: any) => String(p)) : empProjects.split(',').map((p: string) => p.trim());
        } catch {
          projectIds = empProjects.split(',').map((p: string) => p.trim());
        }
      }
      return projectIds.includes(projectId);
    }).map((emp: any) => ({
      ...emp,
      // Ensure salary is available
      salary: emp.salary || emp.salary_amount || 0,
    }));
  }, [batchStep1Data.project_id, employees]);

  // Calculate Net Salary for individual form (Net = Gross - TDS)
  useMemo(() => {
    if (individualFormData.gross_salary !== "") {
      const grossSalary = parseFloat(individualFormData.gross_salary) || 0;
      const tds = parseFloat(individualFormData.tds) || 0;
      const netSalary = grossSalary - tds;
      setIndividualFormData(prev => ({
        ...prev,
        net_salary: netSalary > 0 ? netSalary.toFixed(2) : "0",
      }));
    }
  }, [individualFormData.gross_salary, individualFormData.tds]);

  const createMutation = useMutation({
    mutationFn: (data: any) => salaryService.createSalary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      enqueueSnackbar("Salary payment created successfully", { variant: "success" });
      resetIndividualDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to create salary payment", { variant: "error" });
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: async (salaries: any[]) => {
      const promises = salaries.map(salary => salaryService.createSalary(salary));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      enqueueSnackbar("Batch salary payments created successfully", { variant: "success" });
      resetBatchDialogs();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to create batch salary payments", { variant: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      salaryService.updateSalary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      enqueueSnackbar("Salary payment updated successfully", { variant: "success" });
      resetIndividualDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to update salary payment", { variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => salaryService.deleteSalary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      enqueueSnackbar("Salary payment deleted successfully", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to delete salary payment", { variant: "error" });
    },
  });

  const addAccountMutation = useMutation({
    mutationFn: (data: any) => accountService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      enqueueSnackbar("Account created successfully", { variant: "success" });
      setIsAddAccountDialogOpen(false);
      setAccountForm({
        group_id: "",
        name: "",
        balance: "0",
      });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to create account", { variant: "error" });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (salaries: any[]) => {
      const promises = salaries.map((salary) => salaryService.createSalary(salary));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      enqueueSnackbar("Imported salary payments successfully", { variant: "success" });
      resetImportDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to import salary payments", { variant: "error" });
    },
  });

  const handleAddClick = () => {
    setIsAddDialogOpen(true);
  };

  const handleAddIndividual = () => {
    setIsAddDialogOpen(false);
    setIsIndividualDialogOpen(true);
  };

  const handleAddBatch = () => {
    setIsAddDialogOpen(false);
    setIsBatchStep1DialogOpen(true);
  };

  const handleAddImport = () => {
    setIsAddDialogOpen(false);
    setIsImportDialogOpen(true);
  };

  const handleIndividualSave = () => {
    const payload = {
      date: individualFormData.date,
      employee_id: Number(individualFormData.employee_id),
      account_id: individualFormData.account_id ? Number(individualFormData.account_id) : null,
      gross_salary: Number(individualFormData.gross_salary || 0),
      tds: Number(individualFormData.tds || 0),
      net_salary: Number(individualFormData.net_salary || 0),
    };

    if (editingSalary) {
      updateMutation.mutate({ id: editingSalary.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleBatchStep1Continue = () => {
    if (!batchStep1Data.project_id || !batchStep1Data.date || !batchStep1Data.account_id) {
      enqueueSnackbar("Please fill all required fields", { variant: "error" });
      return;
    }
    setIsBatchStep1DialogOpen(false);
    setIsBatchStep2DialogOpen(true);
    
    // Initialize batch step 2 data with all employees selected and default salary from employee master
    const initialData: Record<number, { selected: boolean; net_salary: string; tds: string; gross_salary: string }> = {};
    batchEmployees.forEach((emp: any) => {
      // Get salary from employee master - check multiple possible field names
      const defaultSalary = (emp.salary || emp.salary_amount || 0).toString();
      const grossSalary = defaultSalary && defaultSalary !== "0" ? defaultSalary : "";
      const tds = grossSalary ? (parseFloat(grossSalary) * 0.1).toFixed(2) : "0";
      const netSalary = grossSalary ? (parseFloat(grossSalary) - parseFloat(tds)).toFixed(2) : "0";
      initialData[emp.id] = { 
        selected: true, 
        gross_salary: grossSalary,
        tds: tds,
        net_salary: netSalary
      };
    });
    setBatchStep2Data(initialData);
  };

  const handleBatchStep2Save = () => {
    const selectedEmployees = Object.entries(batchStep2Data)
      .filter(([_, data]) => data.selected && data.gross_salary)
      .map(([empId, data]) => {
        const gross = Number(data.gross_salary || 0);
        const tds = Number(data.tds || 0);
        const net = Number(data.net_salary || 0);
        return {
          date: batchStep1Data.date,
          employee_id: Number(empId),
          account_id: Number(batchStep1Data.account_id),
          gross_salary: gross,
          tds: tds,
          net_salary: net,
        };
      });

    if (selectedEmployees.length === 0) {
      enqueueSnackbar("Please select at least one employee with salary", { variant: "error" });
      return;
    }

    createBatchMutation.mutate(selectedEmployees);
  };

  const handleImportPreview = async () => {
    if (!importFile) {
      enqueueSnackbar("Please select an Excel file", { variant: "warning" });
      return;
    }

    setIsImporting(true);
    try {
      const response = await salaryService.parseSalaryImport(importFile);

      let rows: any[] = [];
      if (Array.isArray((response as any)?.data)) {
        rows = (response as any).data;
      } else if (Array.isArray((response as any)?.data?.data)) {
        rows = (response as any).data.data;
      } else if (Array.isArray((response as any)?.data?.rows)) {
        rows = (response as any).data.rows;
      } else if (Array.isArray((response as any)?.data?.salaries)) {
        rows = (response as any).data.salaries;
      } else if (Array.isArray(response as any)) {
        rows = response as any[];
      }

      if (!Array.isArray(rows)) {
        rows = [];
      }

      setImportRows(rows);
      enqueueSnackbar(`Parsed ${rows.length} rows`, { variant: "success" });
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to parse Excel file", { variant: "error" });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportRowDelete = (row: any) => {
    setImportRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  const resetImportDialog = () => {
    setIsImportDialogOpen(false);
    setImportFile(null);
    setImportRows([]);
    setImportAccountId("");
    setIsImporting(false);
  };

  const handleImportSave = () => {
    if (!importAccountId) {
      enqueueSnackbar("Please select an account", { variant: "warning" });
      return;
    }
    if (importRows.length === 0) {
      enqueueSnackbar("No rows to import", { variant: "warning" });
      return;
    }

    const invalidRows = importRows.filter((r) => Array.isArray(r.warnings) && r.warnings.length > 0);
    if (invalidRows.length > 0) {
      enqueueSnackbar(`Please fix the Excel file and re-upload. ${invalidRows.length} row(s) have warnings.`, { variant: "warning" });
      return;
    }

    const payload = importRows.map((row) => ({
      date: row.date,
      employee_id: Number(row.employee_id),
      account_id: Number(importAccountId),
      gross_salary: Number(row.gross_salary || 0),
      tds: Number(row.tds || 0),
      net_salary: Number(row.net_salary || 0),
    }));

    importMutation.mutate(payload);
  };

  const handleEdit = async (salary: any) => {
    setIsLoadingSalary(true);
    setIsIndividualDialogOpen(true);
    
    try {
      // Fetch fresh salary data from the API
      const response = await salaryService.getSalary(salary.id);
      const freshSalaryData = response?.data?.salary || response?.salary || response;
      
      setEditingSalary(freshSalaryData);
      const grossValue = Number(freshSalaryData.gross_salary ?? freshSalaryData.salary ?? 0);
      const tdsValue = Number(freshSalaryData.tds ?? 0);
      const netValue = Number(freshSalaryData.net_salary ?? (grossValue - tdsValue));

      setIndividualFormData({
        date: freshSalaryData.date || today(),
        employee_id: freshSalaryData.employee?.id?.toString() || "",
        account_id: freshSalaryData.account?.id?.toString() || "",
        gross_salary: grossValue.toString(),
        tds: tdsValue.toString(),
        net_salary: netValue.toFixed(2),
      });
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Failed to load salary data", { variant: "error" });
      setIsIndividualDialogOpen(false);
    } finally {
      setIsLoadingSalary(false);
    }
  };

  const handleDelete = (salary: any) => {
    if (window.confirm("Delete this salary payment entry?")) {
      deleteMutation.mutate(salary.id);
    }
  };

  const resetIndividualDialog = () => {
    setIsIndividualDialogOpen(false);
    setEditingSalary(null);
    setIndividualFormData({
      date: today(),
      employee_id: "",
      account_id: "",
      net_salary: "",
      tds: "0",
      gross_salary: "0",
    });
  };

  const resetBatchDialogs = () => {
    setIsBatchStep1DialogOpen(false);
    setIsBatchStep2DialogOpen(false);
    setBatchStep1Data({
      project_id: "",
      date: today(),
      account_id: "",
    });
    setBatchStep2Data({});
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || createBatchMutation.isPending;
  const isImportSaving = importMutation.isPending;

  const importTotals = useMemo(() => {
    return importRows.reduce(
      (acc, row) => {
        acc.gross += Number(row.gross_salary || 0);
        acc.tds += Number(row.tds || 0);
        acc.net += Number(row.net_salary || 0);
        return acc;
      },
      { gross: 0, tds: 0, net: 0 }
    );
  }, [importRows]);

  // Calculate Net Salary, TDS, Gross Salary for display
  // Net = Gross - TDS
  const columns: Column<any>[] = [
    {
      header: "Date",
      accessor: "date",
      cellClassName: "text-green-800",
    },
    {
      header: "Employee",
      accessor: (salary) => salary.employee?.name || "—",
      cellClassName: "text-green-700",
    },
    {
      header: "Net Salary",
      accessor: (salary) => (
        <span className="text-green-700 font-semibold">
          {formatCurrency(
            salary.net_salary !== undefined && salary.net_salary !== null
              ? salary.net_salary
              : (Number(salary.gross_salary ?? salary.salary ?? 0) - Number(salary.tds ?? 0))
          )}
        </span>
      ),
    },
    {
      header: "TDS",
      accessor: (salary) => (
        <span className="text-red-600">
          {formatCurrency(salary.tds || 0)}
        </span>
      ),
    },
    {
      header: "Gross Salary",
      accessor: (salary) => {
        const grossSalary = Number(salary.gross_salary ?? salary.salary ?? 0);
        return (
          <span className="text-green-800 font-semibold">
            {formatCurrency(grossSalary)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl text-green-800">Salary Management</h1>
            <div className="text-right ml-4">
              <span className="text-sm text-green-600 font-medium">Total Salary: </span>
              <span className="text-2xl text-green-700 font-semibold">
                {formatCurrency(totalSalary)}
              </span>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Track and manage employee salary payments
          </p>
        </div>
      </div>

      {/* Date & Employee Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-green-600" />
        <div className="flex items-center gap-2">
          <Label className="text-green-700 text-sm">Date</Label>
          <DatePicker
            value={fromDate}
            onChange={(date) => setFromDate(date || "")}
            placeholder="From Date"
            inputClassName="h-9"
          />
          <DatePicker
            value={toDate}
            onChange={(date) => setToDate(date || "")}
            placeholder="To Date"
            inputClassName="h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-green-700 text-sm">Employee</Label>
          <StyledSelect
            value={employeeFilter}
            onChange={(value) => setEmployeeFilter(value)}
            placeholder="All Employees"
            disabled={isEmployeesLoading || isEmployeesError}
            options={employees.map((employee: any) => ({
              value: employee.id?.toString(),
              label: employee.name,
            }))}
            className="min-w-[220px]"
          />
        </div>
        <div className="flex-1" />
        <Button
          onClick={handleAddClick}
          size="icon"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 w-10"
          title="Add Salary Entry"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full border border-green-100 rounded flex items-center justify-center">
            <div className="flex items-center gap-3 text-green-700">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              <span>Loading salary payments...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="h-full border border-red-200 rounded bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error loading salary payments</p>
            <p className="text-sm mt-1">{(error as any)?.message || "Please try again."}</p>
          </div>
        ) : (
          <DataTable
            data={salaries}
            columns={columns}
            getRowKey={(salary) => salary.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowDoubleClick={handleEdit}
            emptyMessage="No salary payments found"
          />
        )}
      </div>

      {/* Add Salary Entry Dialog (Choose Individual or Batch) */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              Add Salary Entry
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Choose how you want to add salary entries
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              onClick={handleAddIndividual}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12"
            >
              Add Individual
            </Button>
            <Button
              onClick={handleAddBatch}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12"
            >
              Add Batch
            </Button>
            <Button
              onClick={handleAddImport}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 h-12"
            >
              Import Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Individual Salary Dialog */}
      <Dialog open={isIndividualDialogOpen} onOpenChange={setIsIndividualDialogOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              {editingSalary ? "Edit Salary Entry" : "Add Individual Salary"}
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              {editingSalary
                ? "Update the salary payment details"
                : "Fill in the details to add a salary entry"}
            </DialogDescription>
          </DialogHeader>
          <Grid>
            <GridItem>
              <DatePicker
                label="Date"
                value={individualFormData.date}
                onChange={(date) => setIndividualFormData({ ...individualFormData, date: date || today() })}
                placeholder="Select date"
                required
              />
            </GridItem>

            <GridItem>
              <Label className="text-green-800 flex items-center gap-1.5">
                Employee <span className="text-red-500">*</span>
              </Label>
              <StyledSelect
                value={individualFormData.employee_id}
                onChange={(value) => setIndividualFormData({ ...individualFormData, employee_id: value })}
                placeholder="Select employee"
                disabled={isEmployeesLoading || isEmployeesError}
                options={employees.map((employee: any) => ({
                  value: employee.id?.toString(),
                  label: employee.name,
                }))}
                className="flex-1"
              />
            </GridItem>

            <GridItem>
              <Label className="text-green-800 flex items-center gap-1.5">
                Account <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <StyledSelect
                  value={individualFormData.account_id}
                  onChange={(value) => setIndividualFormData({ ...individualFormData, account_id: value })}
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
                Gross Salary <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={individualFormData.gross_salary}
                onChange={(e) => {
                  const grossSalary = e.target.value;
                  const tds = (parseFloat(grossSalary) * 0.1).toFixed(2);
                  setIndividualFormData({
                    ...individualFormData,
                    gross_salary: grossSalary,
                    tds: tds,
                  });
                }}
                placeholder="Enter gross salary"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
              />
            </GridItem>

            <GridItem>
              <Label className="text-green-800">TDS (10%)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={individualFormData.tds}
                onChange={(e) => setIndividualFormData({ ...individualFormData, tds: e.target.value })}
                placeholder="Enter TDS amount"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
              />
            </GridItem>

            <GridItem>
              <Label className="text-green-800">Net Salary</Label>
              <Input
                type="number"
                value={individualFormData.net_salary}
                disabled
                className="border-green-200 bg-green-50 h-11"
              />
            </GridItem>
          </Grid>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={resetIndividualDialog}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleIndividualSave}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={
                isSaving ||
                !individualFormData.date ||
                !individualFormData.employee_id ||
                !individualFormData.account_id ||
                !individualFormData.gross_salary
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingSalary ? "Update Entry" : "Add Entry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Salary Dialog */}
      <Dialog
        open={isImportDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetImportDialog();
          } else {
            setIsImportDialogOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[1000px] bg-white border-green-200 shadow-xl rounded-lg">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Import Salary from Excel
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Upload the Excel file and preview rows before saving. If warnings exist, fix the Excel and re-upload.
            </DialogDescription>
          </DialogHeader>

          {importRows.length === 0 ? (
            <div className="space-y-6 py-2">
              <div className="space-y-2">
                <Label className="text-green-800">Account <span className="text-red-500">*</span></Label>
                <StyledSelect
                  value={importAccountId}
                  onChange={(value) => setImportAccountId(value)}
                  placeholder="- Select -"
                  disabled={isAccountsLoading || isAccountsError}
                  options={accounts.map((account: any) => ({
                    value: account.id?.toString(),
                    label: account.name,
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-800">Excel File (.xlsx) <span className="text-red-500">*</span></Label>
                <div className="border-2 border-dashed border-green-200 rounded-lg p-8 text-center bg-green-50/30 hover:bg-green-50/50 transition-colors cursor-pointer relative">
                  <Input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <Upload className="w-8 h-8 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      {importFile ? importFile.name : "Click to upload or drag and drop"}
                    </span>
                    {!importFile && (
                      <span className="text-xs text-green-500">
                        Header row required. Columns: Date, Account, Debit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {importRows.some((r) => Array.isArray(r.warnings) && r.warnings.length > 0) && (
                <div className="text-sm text-red-600">
                  Some rows are not matched. Please fix the Excel file and re-upload before saving.
                </div>
              )}
              <div className="h-[420px]">
                <DataTable
                  data={importRows}
                  columns={[
                    { header: "Row", accessor: (row) => row.row_index ?? row.rowIndex ?? row.id, cellClassName: "text-green-800" },
                    { header: "Date", accessor: (row) => row.date || "—", cellClassName: "text-green-800" },
                    {
                      header: "Account",
                      accessor: (row) => (
                        <span className={row.employee_id ? "text-green-800" : "text-red-600"}>
                          {row.account || "—"}
                        </span>
                      ),
                    },
                    {
                      header: "Gross",
                      accessor: (row) => formatCurrency(row.gross_salary || 0),
                      className: "text-right",
                      cellClassName: "text-green-800 text-right",
                    },
                    {
                      header: "TDS (10%)",
                      accessor: (row) => formatCurrency(row.tds || 0),
                      className: "text-right",
                      cellClassName: "text-red-600 text-right",
                    },
                    {
                      header: "Net",
                      accessor: (row) => formatCurrency(row.net_salary || 0),
                      className: "text-right",
                      cellClassName: "text-green-800 text-right",
                    },
                  ]}
                  getRowKey={(row) => row.id}
                  onDelete={handleImportRowDelete}
                  showPagination={false}
                  autoCalculatePageSize={false}
                  pageSize={Math.max(importRows.length, 1)}
                  bodyClassName="overflow-auto max-h-[420px]"
                />
              </div>
              <div className="flex items-center justify-end gap-6 text-sm text-green-800">
                <div>Gross: <span className="font-semibold">{formatCurrency(importTotals.gross)}</span></div>
                <div>TDS: <span className="font-semibold text-red-600">{formatCurrency(importTotals.tds)}</span></div>
                <div>Net: <span className="font-semibold">{formatCurrency(importTotals.net)}</span></div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={resetImportDialog}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={isImporting || isImportSaving}
            >
              Cancel
            </Button>
            {importRows.length === 0 ? (
              <Button
                onClick={handleImportPreview}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
                disabled={!importFile || isImporting || !importAccountId}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  "Import & Preview"
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setImportRows([])}
                  className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
                  disabled={isImportSaving}
                >
                  Back
                </Button>
                <Button
                  onClick={handleImportSave}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
                  disabled={isImportSaving}
                >
                  {isImportSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Imported Rows"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Salary Step 1 Dialog */}
      <Dialog open={isBatchStep1DialogOpen} onOpenChange={setIsBatchStep1DialogOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              Add Batch Salary - Step 1
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Select project and date for batch salary entry
            </DialogDescription>
          </DialogHeader>
          <Grid>
            <GridItem>
              <Label className="text-green-800 flex items-center gap-1.5">
                Project <span className="text-red-500">*</span>
              </Label>
              <StyledSelect
                value={batchStep1Data.project_id}
                onChange={(value) => setBatchStep1Data({ ...batchStep1Data, project_id: value })}
                placeholder="Select project"
                disabled={isProjectsLoading || isProjectsError}
                options={projects.map((project: any) => ({
                  value: project.id?.toString(),
                  label: project.name,
                }))}
                className="flex-1"
              />
            </GridItem>

            <GridItem>
              <DatePicker
                label="Date"
                value={batchStep1Data.date}
                onChange={(date) => setBatchStep1Data({ ...batchStep1Data, date: date || today() })}
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
                  value={batchStep1Data.account_id}
                  onChange={(value) => setBatchStep1Data({ ...batchStep1Data, account_id: value })}
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
          </Grid>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={resetBatchDialogs}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchStep1Continue}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={
                !batchStep1Data.project_id ||
                !batchStep1Data.date ||
                !batchStep1Data.account_id
              }
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Salary Step 2 Dialog */}
      <Dialog open={isBatchStep2DialogOpen} onOpenChange={setIsBatchStep2DialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-green-200 shadow-xl rounded-sm max-h-[80vh] flex flex-col">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              Add Batch Salary - Step 2
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Select employees and enter salary amounts
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-3">
              {/* Header Row */}
              <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-4 pb-2 border-b border-green-100 font-semibold text-green-800">
                <div className="flex items-center gap-2 min-w-[200px]">
                  <Checkbox
                    checked={batchEmployees.every((emp: any) => batchStep2Data[emp.id]?.selected)}
                    onCheckedChange={(checked) => {
                      const newData = { ...batchStep2Data };
                      batchEmployees.forEach((emp: any) => {
                        const currentData = newData[emp.id] || { gross_salary: "", tds: "0", net_salary: "0" };
                        newData[emp.id] = {
                          selected: checked as boolean,
                          gross_salary: currentData.gross_salary || "",
                          tds: currentData.tds || "0",
                          net_salary: currentData.net_salary || "0",
                        };
                      });
                      setBatchStep2Data(newData);
                    }}
                  />
                  <span>Employee Name</span>
                </div>
                <span className="text-center">Gross Salary</span>
                <span className="text-center">TDS (10%)</span>
                <span className="text-center">Net Salary</span>
              </div>
              
              {/* Employee Rows */}
              {batchEmployees.map((employee: any) => {
                // Get employee data, fallback to empty if not initialized
                let empData = batchStep2Data[employee.id];
                if (!empData) {
                  // Initialize with employee master salary if available
                  const defaultSalary = (employee.salary || employee.salary_amount || 0).toString();
                  const grossSalary = defaultSalary && defaultSalary !== "0" ? defaultSalary : "";
                  const tds = grossSalary ? (parseFloat(grossSalary) * 0.1).toFixed(2) : "0";
                  const netSalary = grossSalary ? (parseFloat(grossSalary) - parseFloat(tds)).toFixed(2) : "0";
                  empData = { selected: false, gross_salary: grossSalary, tds: tds, net_salary: netSalary };
                }
                const grossSalary = parseFloat(empData.gross_salary) || 0;
                const tds = grossSalary ? (grossSalary * 0.1).toFixed(2) : "0";
                const netSalary = grossSalary ? (grossSalary - parseFloat(tds)).toFixed(2) : "0";
                
                return (
                  <div key={employee.id} className="grid grid-cols-[auto_1fr_1fr_1fr] gap-4 items-center">
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <Checkbox
                        checked={empData.selected || false}
                        onCheckedChange={(checked) => {
                          setBatchStep2Data({
                            ...batchStep2Data,
                            [employee.id]: {
                              selected: checked as boolean,
                              gross_salary: empData.gross_salary || "",
                              tds: empData.tds || "0",
                              net_salary: empData.net_salary || "0",
                            },
                          });
                        }}
                      />
                      <span className="text-green-700">{employee.name}</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={empData.gross_salary || ""}
                      onChange={(e) => {
                        const newGrossSalary = e.target.value;
                        const newTds = newGrossSalary ? (parseFloat(newGrossSalary) * 0.1).toFixed(2) : "0";
                        const newNetSalary = newGrossSalary ? (parseFloat(newGrossSalary) - parseFloat(newTds)).toFixed(2) : "0";
                        setBatchStep2Data({
                          ...batchStep2Data,
                          [employee.id]: {
                            selected: empData.selected || false,
                            gross_salary: newGrossSalary,
                            tds: newTds,
                            net_salary: newNetSalary,
                          },
                        });
                      }}
                      placeholder="Enter gross"
                      className="border-green-200 focus:border-green-400 focus:ring-green-400 h-10"
                      disabled={!empData.selected}
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tds}
                      readOnly
                      className="border-green-200 bg-green-50 h-10 text-green-700"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={netSalary}
                      readOnly
                      className="border-green-200 bg-green-50 h-10 text-green-700"
                    />
                  </div>
                );
              })}
              {batchEmployees.length === 0 && (
                <div className="text-center text-green-600 py-8">
                  No employees found for the selected project
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsBatchStep2DialogOpen(false);
                setIsBatchStep1DialogOpen(true);
              }}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={isSaving}
            >
              Back
            </Button>
            <Button
              onClick={handleBatchStep2Save}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={isSaving || batchEmployees.length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Selected Entries"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Account Dialog */}
      <Dialog open={isAddAccountDialogOpen} onOpenChange={setIsAddAccountDialogOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">Add Account</DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Create a new account to use for salary entries
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
    </div>
  );
}
