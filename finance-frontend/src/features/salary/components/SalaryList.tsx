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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isIndividualDialogOpen, setIsIndividualDialogOpen] = useState(false);
  const [isBatchStep1DialogOpen, setIsBatchStep1DialogOpen] = useState(false);
  const [isBatchStep2DialogOpen, setIsBatchStep2DialogOpen] = useState(false);
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
    queryKey: ["salaries", { from_date: fromDate, to_date: toDate }],
    queryFn: () => salaryService.getSalaries({ 
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
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

  // Calculate TDS and Gross Salary for individual form
  useMemo(() => {
    if (individualFormData.net_salary) {
      const netSalary = parseFloat(individualFormData.net_salary) || 0;
      const tds = parseFloat(individualFormData.tds) || 0;
      const grossSalary = netSalary - tds;
      setIndividualFormData(prev => ({
        ...prev,
        gross_salary: grossSalary > 0 ? grossSalary.toFixed(2) : "0",
      }));
    }
  }, [individualFormData.net_salary, individualFormData.tds]);

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

  const handleIndividualSave = () => {
    const payload = {
      date: individualFormData.date,
      employee_id: Number(individualFormData.employee_id),
      account_id: individualFormData.account_id ? Number(individualFormData.account_id) : null,
      salary: Number(individualFormData.net_salary || 0), // Storing as net_salary in DB
      tds: Number(individualFormData.tds || 0),
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
      const netSalary = defaultSalary && defaultSalary !== "0" ? defaultSalary : "";
      const tds = netSalary ? (parseFloat(netSalary) * 0.1).toFixed(2) : "0";
      const grossSalary = netSalary ? (parseFloat(netSalary) - parseFloat(tds)).toFixed(2) : "0";
      initialData[emp.id] = { 
        selected: true, 
        net_salary: netSalary,
        tds: tds,
        gross_salary: grossSalary
      };
    });
    setBatchStep2Data(initialData);
  };

  const handleBatchStep2Save = () => {
    const selectedEmployees = Object.entries(batchStep2Data)
      .filter(([_, data]) => data.selected && data.net_salary)
      .map(([empId, data]) => ({
        date: batchStep1Data.date,
        employee_id: Number(empId),
        account_id: Number(batchStep1Data.account_id),
        salary: Number(data.net_salary),
        tds: Number(data.tds || 0),
      }));

    if (selectedEmployees.length === 0) {
      enqueueSnackbar("Please select at least one employee with salary", { variant: "error" });
      return;
    }

    createBatchMutation.mutate(selectedEmployees);
  };

  const handleEdit = async (salary: any) => {
    setIsLoadingSalary(true);
    setIsIndividualDialogOpen(true);
    
    try {
      // Fetch fresh salary data from the API
      const response = await salaryService.getSalary(salary.id);
      const freshSalaryData = response?.data?.salary || response?.salary || response;
      
      setEditingSalary(freshSalaryData);
      setIndividualFormData({
        date: freshSalaryData.date || today(),
        employee_id: freshSalaryData.employee?.id?.toString() || "",
        account_id: freshSalaryData.account?.id?.toString() || "",
        net_salary: freshSalaryData.salary?.toString() || freshSalaryData.net_salary?.toString() || "",
        tds: freshSalaryData.tds?.toString() || "0",
        gross_salary: ((freshSalaryData.salary || freshSalaryData.net_salary || 0) - (freshSalaryData.tds || 0)).toFixed(2),
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

  // Calculate Net Salary, TDS, Gross Salary for display
  // Based on screenshot: Net Salary = what company pays, TDS = tax, Gross Salary = Net - TDS
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
          {formatCurrency(salary.salary)}
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
        const grossSalary = (salary.salary || 0) - (salary.tds || 0);
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
        <div>
          <h1 className="text-3xl text-green-800">Salary Management</h1>
          <p className="text-sm text-green-600 mt-1">
            Track and manage employee salary payments
          </p>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex items-center gap-3">
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
                Net Salary <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={individualFormData.net_salary}
                onChange={(e) => {
                  const netSalary = e.target.value;
                  const tds = (parseFloat(netSalary) * 0.1).toFixed(2);
                  setIndividualFormData({
                    ...individualFormData,
                    net_salary: netSalary,
                    tds: tds,
                  });
                }}
                placeholder="Enter net salary"
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
              <Label className="text-green-800">Gross Salary</Label>
              <Input
                type="number"
                value={individualFormData.gross_salary}
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
                !individualFormData.net_salary
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
                        const currentData = newData[emp.id] || { net_salary: "", tds: "0", gross_salary: "0" };
                        newData[emp.id] = {
                          selected: checked as boolean,
                          net_salary: currentData.net_salary || "",
                          tds: currentData.tds || "0",
                          gross_salary: currentData.gross_salary || "0",
                        };
                      });
                      setBatchStep2Data(newData);
                    }}
                  />
                  <span>Employee Name</span>
                </div>
                <span className="text-center">Net Salary</span>
                <span className="text-center">TDS (10%)</span>
                <span className="text-center">Gross Salary</span>
              </div>
              
              {/* Employee Rows */}
              {batchEmployees.map((employee: any) => {
                // Get employee data, fallback to empty if not initialized
                let empData = batchStep2Data[employee.id];
                if (!empData) {
                  // Initialize with employee master salary if available
                  const defaultSalary = (employee.salary || employee.salary_amount || 0).toString();
                  const netSalary = defaultSalary && defaultSalary !== "0" ? defaultSalary : "";
                  const tds = netSalary ? (parseFloat(netSalary) * 0.1).toFixed(2) : "0";
                  const grossSalary = netSalary ? (parseFloat(netSalary) - parseFloat(tds)).toFixed(2) : "0";
                  empData = { selected: false, net_salary: netSalary, tds: tds, gross_salary: grossSalary };
                }
                const netSalary = parseFloat(empData.net_salary) || 0;
                const tds = netSalary ? (netSalary * 0.1).toFixed(2) : "0";
                const grossSalary = netSalary ? (netSalary - parseFloat(tds)).toFixed(2) : "0";
                
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
                              net_salary: empData.net_salary || "",
                              tds: empData.tds || "0",
                              gross_salary: empData.gross_salary || "0",
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
                      value={empData.net_salary || ""}
                      onChange={(e) => {
                        const newNetSalary = e.target.value;
                        const newTds = newNetSalary ? (parseFloat(newNetSalary) * 0.1).toFixed(2) : "0";
                        const newGrossSalary = newNetSalary ? (parseFloat(newNetSalary) - parseFloat(newTds)).toFixed(2) : "0";
                        setBatchStep2Data({
                          ...batchStep2Data,
                          [employee.id]: {
                            selected: empData.selected || false,
                            net_salary: newNetSalary,
                            tds: newTds,
                            gross_salary: newGrossSalary,
                          },
                        });
                      }}
                      placeholder="Enter salary"
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
                      value={grossSalary}
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
