import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { DataTable, Column } from "@components/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Plus, Pencil, Archive, Search, Loader2 } from "lucide-react";
import { MultiSelect } from "@components/MultiSelect";
import { Grid, GridItem } from "@components/common/Grid";
import { employeeService } from "@api/services/employeeService";
import { projectService } from "@api/services/projectService";
import axiosInstance from "@api/axios";
import { ENDPOINTS } from "@api/endpoints";

interface Employee {
  id: number;
  name: string;
  accName: string;
  accNumber: string;
  ifscCode: string;
  panNo: string;
  salary?: number;
  projects: string[];
  status: "active" | "archived";
}

export function EmployeeList() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    accName: "",
    accNumber: "",
    ifscCode: "",
    panNo: "",
    salary: "",
    projects: [] as string[],
  });

  // Fetch projects for dropdown (needed before normalizing employees)
  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectService.getProjects({ status: "active", per_page: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

  const projectsList =
    projectsData?.data?.projects ||
    projectsData?.projects ||
    projectsData?.data ||
    projectsData ||
    [];

  // Create a map of project ID to name for display
  const projectMap = new Map<number, string>();
  projectsList.forEach((project: any) => {
    if (project.id && project.name) {
      projectMap.set(project.id, project.name);
    }
  });

  // Fetch employees
  const {
    data: employeesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["employees", { search: searchQuery }],
    queryFn: () => employeeService.getEmployees({ search: searchQuery, status: "active" }),
    retry: 1,
  });

  const normalizeEmployees = (items: any[], projectMap: Map<number, string>): Employee[] =>
    (items || []).map((item) => {
      const rawProjects = item.projects ?? item.project_ids ?? [];
      let projectIds: string[] = [];

      if (Array.isArray(rawProjects)) {
        // If array, convert to string IDs
        projectIds = rawProjects.map((p: any) => {
          if (typeof p === 'number') return p.toString();
          if (typeof p === 'string') {
            // Check if it's already an ID (numeric string) or a name
            const num = parseInt(p, 10);
            if (!isNaN(num)) return p;
            // If it's a name, try to find the ID from projectMap
            for (const [id, name] of projectMap.entries()) {
              if (name === p) return id.toString();
            }
            return p; // Fallback to original value
          }
          return String(p);
        });
      } else if (typeof rawProjects === "string" && rawProjects.length > 0) {
        try {
          const parsed = JSON.parse(rawProjects);
          if (Array.isArray(parsed)) {
            projectIds = parsed.map((p: any) => {
              if (typeof p === 'number') return p.toString();
              if (typeof p === 'string') {
                const num = parseInt(p, 10);
                if (!isNaN(num)) return p;
                // Try to find ID from name
                for (const [id, name] of projectMap.entries()) {
                  if (name === p) return id.toString();
                }
                return p;
              }
              return String(p);
            });
          } else {
            projectIds = rawProjects.split(",").map((p: string) => {
              const trimmed = p.trim();
              const num = parseInt(trimmed, 10);
              if (!isNaN(num)) return trimmed;
              // Try to find ID from name
              for (const [id, name] of projectMap.entries()) {
                if (name === trimmed) return id.toString();
              }
              return trimmed;
            });
          }
        } catch {
          projectIds = rawProjects.split(",").map((p: string) => {
            const trimmed = p.trim();
            const num = parseInt(trimmed, 10);
            if (!isNaN(num)) return trimmed;
            // Try to find ID from name
            for (const [id, name] of projectMap.entries()) {
              if (name === trimmed) return id.toString();
            }
            return trimmed;
          });
        }
      }

      return {
        id: item.id,
        name: item.name || "",
        accName: item.account_name || item.acc_name || item.accName || "",
        accNumber: item.account_number || item.acc_number || item.accNumber || item.bank_account || "",
        ifscCode: item.ifsc_code || item.ifscCode || "",
        panNo: item.pan_no || item.panNo || item.pan_card || "",
        salary: (item.salary !== undefined && item.salary !== null) ? Number(item.salary) : ((item.salary_amount !== undefined && item.salary_amount !== null) ? Number(item.salary_amount) : 0),
        projects: projectIds, // Store as IDs (string array)
        status: item.status || "active",
      };
    });

  // Extract employees from response (handle different response structures)
  const rawEmployees = employeesData?.data?.employees ||
    employeesData?.employees ||
    employeesData?.data ||
    employeesData ||
    [];

  const employees: Employee[] = normalizeEmployees(rawEmployees, projectMap);

  // Available project options for MultiSelect (as IDs converted to strings)
  const availableProjects: string[] = projectsList
    .map((project: any) => project.id?.toString())
    .filter((id: string | undefined) => id !== undefined);

  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: (payload: { name: string }) =>
      axiosInstance.post(ENDPOINTS.PROJECTS.CREATE, payload),
    onSuccess: (data) => {
      const addedProjectId =
        data?.data?.project?.id ||
        data?.project?.id ||
        data?.id;

      if (addedProjectId) {
        setFormData((prev) => ({
          ...prev,
          projects: Array.from(new Set([...prev.projects, addedProjectId.toString()])),
        }));
      }

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsAddProjectDialogOpen(false);
      setNewProjectName("");
      enqueueSnackbar("Project added successfully", { variant: "success" });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || "Failed to add project", { variant: "error" });
    },
  });

  // Create employee mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Employee, "id" | "status">) => employeeService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      enqueueSnackbar("Employee added successfully!", { variant: "success" });
      setIsDialogOpen(false);
      setFormData({
        name: "",
        accName: "",
        accNumber: "",
        ifscCode: "",
        panNo: "",
        salary: "",
        projects: [],
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || "Failed to add employee", { variant: "error" });
    },
  });

  // Update employee mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Employee> }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      enqueueSnackbar("Employee updated successfully!", { variant: "success" });
      setIsDialogOpen(false);
      setEditingEmployee(null);
      setFormData({
        name: "",
        accName: "",
        accNumber: "",
        ifscCode: "",
        panNo: "",
        salary: "",
        projects: [],
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || "Failed to update employee", { variant: "error" });
    },
  });

  // Archive employee mutation
  const archiveMutation = useMutation({
    mutationFn: (id: number) => employeeService.archiveEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      enqueueSnackbar("Employee archived successfully!", { variant: "success" });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || "Failed to archive employee", { variant: "error" });
    },
  });

  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormData({
      name: "",
      accName: "",
      accNumber: "",
      ifscCode: "",
      panNo: "",
      salary: "",
      projects: [],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = async (employee: Employee) => {
    setIsLoadingEmployee(true);
    setIsDialogOpen(true);

    try {
      // Fetch fresh employee data from the API
      const response = await employeeService.getEmployee(employee.id);
      const freshEmployeeData = response?.data?.employee || response?.employee || response;

      // Normalize the fresh employee data using the same logic
      const projectMap = new Map<number, string>();
      projectsList.forEach((project: any) => {
        if (project.id && project.name) {
          projectMap.set(project.id, project.name);
        }
      });

      const normalizedEmployee = normalizeEmployees([freshEmployeeData], projectMap)[0];

      setEditingEmployee(normalizedEmployee);
      setFormData({
        name: normalizedEmployee.name,
        accName: normalizedEmployee.accName,
        accNumber: normalizedEmployee.accNumber,
        ifscCode: normalizedEmployee.ifscCode,
        panNo: normalizedEmployee.panNo,
        salary: normalizedEmployee.salary !== undefined && normalizedEmployee.salary !== null ? normalizedEmployee.salary.toString() : "",
        projects: normalizedEmployee.projects || [],
      });
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Failed to load employee data", { variant: "error" });
      setIsDialogOpen(false);
    } finally {
      setIsLoadingEmployee(false);
    }
  };

  const handleArchive = (id: number) => {
    if (window.confirm("Are you sure you want to archive this employee?")) {
      archiveMutation.mutate(id);
    }
  };

  const buildPayload = () => ({
    name: formData.name,
    account_name: formData.accName,
    account_number: formData.accNumber,
    ifsc_code: formData.ifscCode,
    pan_no: formData.panNo,
    salary: formData.salary ? Number(formData.salary) : 0,
    projects: formData.projects,
  });

  const handleSave = () => {
    if (editingEmployee) {
      // Update existing employee
      updateMutation.mutate({
        id: editingEmployee.id,
        data: buildPayload(),
      });
    } else {
      // Add new employee
      createMutation.mutate(buildPayload());
    }
  };

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    addProjectMutation.mutate({ name: newProjectName.trim() });
  };

  const filteredEmployees = employees.filter((emp) => {
    if (searchQuery === "") return emp.status === "active";
    return (
      emp.status === "active" &&
      (emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.accNumber.includes(searchQuery) ||
        emp.panNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const columns: Column<Employee>[] = [
    {
      header: "Employee Name",
      accessor: "name",
      cellClassName: "text-green-800",
    },
    {
      header: "Account Name",
      accessor: "accName",
      cellClassName: "text-green-700",
    },
    {
      header: "Account Number",
      accessor: "accNumber",
      cellClassName: "text-green-700 font-mono text-sm",
    },
    {
      header: "IFSC Code",
      accessor: "ifscCode",
      cellClassName: "text-green-700 font-mono text-sm",
    },
    {
      header: "PAN No.",
      accessor: "panNo",
      cellClassName: "text-green-700 font-mono text-sm",
    },
    {
      header: "Projects",
      accessor: (employee) => (
        <div className="flex flex-wrap gap-1">
          {(employee.projects || []).map((projectId, idx) => {
            const projectName = projectMap.get(parseInt(projectId, 10)) || projectId;
            return (
              <Badge
                key={idx}
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 text-xs"
              >
                {projectName}
              </Badge>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full w-full flex-1 gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-green-800">Employees</h1>
          <p className="text-sm text-green-600 mt-1">
            Manage your employee information
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
          <Input
            placeholder="Search by name, account number, or PAN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
          />
        </div>
        <Button
          onClick={handleAddNew}
          size="icon"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 w-10"
          title="Add New Employee"
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
              <span>Loading employees...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="h-full border border-red-200 rounded bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error loading employees</p>
            <p className="text-sm mt-1">
              {(error as any)?.message || "Failed to fetch employees. Please try again."}
            </p>
          </div>
        ) : (
          <DataTable
            data={filteredEmployees}
            columns={columns}
            getRowKey={(employee) => employee.id}
            onEdit={handleEdit}
            onRowDoubleClick={handleEdit}
            renderActions={(employee) => (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                onClick={() => handleArchive(employee.id)}
                title="Archive Employee"
                disabled={archiveMutation.isPending}
              >
                <Archive className="w-4 h-4" />
              </Button>
            )}
            emptyMessage={searchQuery ? "No employees found matching your search" : "No employees found"}
          />
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              {editingEmployee
                ? "Update employee information below"
                : "Fill in the details to add a new employee"}
            </DialogDescription>
          </DialogHeader>
          {isLoadingEmployee ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-green-700">
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                <span>Loading employee data...</span>
              </div>
            </div>
          ) : (
            <Grid>
              <GridItem>
                <Label htmlFor="name" className="text-green-800 flex items-center gap-1.5">
                  Employee Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
                  disabled={isLoadingEmployee}
                />
              </GridItem>
              <GridItem>
                <Label htmlFor="accName" className="text-green-800 flex items-center gap-1.5">
                  Account Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accName"
                  value={formData.accName}
                  onChange={(e) =>
                    setFormData({ ...formData, accName: e.target.value })
                  }
                  placeholder="Enter account holder name"
                  className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
                  disabled={isLoadingEmployee}
                />
              </GridItem>
              <GridItem>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accNumber" className="text-green-800 flex items-center gap-1.5">
                      Account Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="accNumber"
                      value={formData.accNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, accNumber: e.target.value })
                      }
                      placeholder="Enter account number"
                      className="border-green-200 focus:border-green-400 focus:ring-green-400 font-mono h-11"
                      disabled={isLoadingEmployee}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode" className="text-green-800 flex items-center gap-1.5">
                      IFSC Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ifscCode"
                      value={formData.ifscCode}
                      onChange={(e) =>
                        setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })
                      }
                      placeholder="Enter IFSC code"
                      className="border-green-200 focus:border-green-400 focus:ring-green-400 font-mono h-11"
                      disabled={isLoadingEmployee}
                    />
                  </div>
                </div>
              </GridItem>
              <GridItem>
                <Label htmlFor="panNo" className="text-green-800 flex items-center gap-1.5">
                  PAN Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="panNo"
                  value={formData.panNo}
                  onChange={(e) =>
                    setFormData({ ...formData, panNo: e.target.value.toUpperCase() })
                  }
                  placeholder="Enter PAN number"
                  className="border-green-200 focus:border-green-400 focus:ring-green-400 font-mono h-11"
                  maxLength={10}
                  disabled={isLoadingEmployee}
                />
              </GridItem>
              <GridItem>
                <Label htmlFor="salary" className="text-green-800">
                  Salary
                </Label>
                <Input
                  id="salary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  placeholder="Enter salary amount"
                  className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
                  disabled={isLoadingEmployee}
                />
              </GridItem>
              <GridItem>
                <Label htmlFor="projects" className="text-green-800">
                  Projects
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <MultiSelect
                      options={availableProjects.map((id) => {
                        const name = projectMap.get(parseInt(id, 10)) || id;
                        return `${id}:${name}`; // Format: "ID:Name" for display
                      })}
                      selected={formData.projects.map((id) => {
                        const name = projectMap.get(parseInt(id, 10)) || id;
                        return `${id}:${name}`;
                      })}
                      onChange={(selected) => {
                        // Extract IDs from "ID:Name" format
                        const projectIds = selected.map((item) => {
                          const parts = item.split(':');
                          return parts[0]; // Return the ID part
                        });
                        setFormData({ ...formData, projects: projectIds });
                      }}
                      placeholder={
                        isProjectsLoading
                          ? "Loading projects..."
                          : isProjectsError
                            ? "Failed to load projects"
                            : "Select projects"
                      }
                      disabled={isProjectsLoading || isProjectsError || isLoadingEmployee}
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-11 w-11 border-green-200 text-green-700 hover:bg-green-50 flex-shrink-0"
                    onClick={() => setIsAddProjectDialogOpen(true)}
                    title="Add New Project"
                    disabled={isProjectsLoading || addProjectMutation.isPending || isLoadingEmployee}
                  >
                    {addProjectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </GridItem>
            </Grid>
          )}
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setIsLoadingEmployee(false);
              }}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={isSaving || isLoadingEmployee}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={
                isSaving ||
                !formData.name ||
                !formData.accName ||
                !formData.accNumber ||
                !formData.ifscCode ||
                !formData.panNo
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingEmployee ? "Updating..." : "Adding..."}
                </>
              ) : (
                editingEmployee ? "Update Employee" : "Add Employee"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={isAddProjectDialogOpen} onOpenChange={setIsAddProjectDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              Add New Project
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Enter the project name. This will be available in the project list immediately.
            </DialogDescription>
          </DialogHeader>
          <Grid>
            <GridItem>
              <Label htmlFor="newProjectName" className="text-green-800 flex items-center gap-1.5">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newProjectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
                disabled={addProjectMutation.isPending}
              />
            </GridItem>
          </Grid>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddProjectDialogOpen(false)}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={addProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProject}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={!newProjectName.trim() || addProjectMutation.isPending}
            >
              {addProjectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
