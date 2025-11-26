import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
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
  projects: string[];
  status: "active" | "archived";
}

export function EmployeeList() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    accName: "",
    accNumber: "",
    ifscCode: "",
    panNo: "",
    projects: [] as string[],
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

  const normalizeEmployees = (items: any[]): Employee[] =>
    (items || []).map((item) => {
      const rawProjects = item.projects ?? item.project_ids ?? [];
      let projectsArray: string[] = [];

      if (Array.isArray(rawProjects)) {
        projectsArray = rawProjects;
      } else if (typeof rawProjects === "string" && rawProjects.length > 0) {
        try {
          const parsed = JSON.parse(rawProjects);
          projectsArray = Array.isArray(parsed) ? parsed : rawProjects.split(",").map((p) => p.trim());
        } catch {
          projectsArray = rawProjects.split(",").map((p) => p.trim());
        }
      }

      return {
        id: item.id,
        name: item.name || "",
        accName: item.acc_name || item.accName || "",
        accNumber: item.acc_number || item.accNumber || item.bank_account || "",
        ifscCode: item.ifsc_code || item.ifscCode || "",
        panNo: item.pan_no || item.panNo || item.pan_card || "",
        projects: projectsArray,
        status: item.status || "active",
      };
    });

  // Extract employees from response (handle different response structures)
  const rawEmployees = employeesData?.data?.employees ||
    employeesData?.employees ||
    employeesData?.data ||
    employeesData ||
    [];

  const employees: Employee[] = normalizeEmployees(rawEmployees);

  // Fetch projects for dropdown
  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectService.getProjects({ status: "active", per_page: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

  const availableProjects: string[] =
    projectsData?.data?.projects?.map((project: any) => project.name) ??
    projectsData?.projects?.map((project: any) => project.name) ??
    [];

  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: (payload: { name: string }) =>
      axiosInstance.post(ENDPOINTS.PROJECTS.CREATE, payload),
    onSuccess: (data) => {
      const addedProjectName =
        data?.data?.project?.name ||
        data?.project?.name ||
        data?.name ||
        newProjectName.trim();

      if (addedProjectName) {
        setFormData((prev) => ({
          ...prev,
          projects: Array.from(new Set([...prev.projects, addedProjectName])),
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
      projects: [],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      accName: employee.accName,
      accNumber: employee.accNumber,
      ifscCode: employee.ifscCode,
      panNo: employee.panNo,
      projects: employee.projects || [],
    });
    setIsDialogOpen(true);
  };

  const handleArchive = (id: number) => {
    if (window.confirm("Are you sure you want to archive this employee?")) {
      archiveMutation.mutate(id);
    }
  };

  const buildPayload = () => ({
    name: formData.name,
    acc_name: formData.accName,
    acc_number: formData.accNumber,
    ifsc_code: formData.ifscCode,
    pan_no: formData.panNo,
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

  return (
    <div className="space-y-6">
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="ml-3 text-green-700">Loading employees...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading employees</p>
          <p className="text-sm mt-1">
            {(error as any)?.message || "Failed to fetch employees. Please try again."}
          </p>
        </div>
      )}

      {/* Employee Table */}
      {!isLoading && !isError && (
        <div>
          <div className="border border-green-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-green-50/50 hover:bg-green-50/50">
                  <TableHead className="text-green-800">Employee Name</TableHead>
                  <TableHead className="text-green-800">Account Name</TableHead>
                  <TableHead className="text-green-800">Account Number</TableHead>
                  <TableHead className="text-green-800">IFSC Code</TableHead>
                  <TableHead className="text-green-800">PAN No.</TableHead>
                  <TableHead className="text-green-800">Projects</TableHead>
                  <TableHead className="text-green-800 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-green-600">
                      {searchQuery ? "No employees found matching your search" : "No employees found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="hover:bg-green-50/30 transition-colors cursor-pointer [&:hover_.action-buttons]:opacity-100"
                    onDoubleClick={() => handleEdit(employee)}
                  >
                      <TableCell className="text-green-800">
                        {employee.name}
                      </TableCell>
                      <TableCell className="text-green-700">
                        {employee.accName}
                      </TableCell>
                      <TableCell className="text-green-700 font-mono text-sm">
                        {employee.accNumber}
                      </TableCell>
                      <TableCell className="text-green-700 font-mono text-sm">
                        {employee.ifscCode}
                      </TableCell>
                      <TableCell className="text-green-700 font-mono text-sm">
                        {employee.panNo}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(employee.projects || []).map((project, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              {project}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 action-buttons opacity-0 transition-opacity duration-200">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-700 hover:bg-green-50 hover:text-green-800"
                            onClick={() => handleEdit(employee)}
                            title="Edit Employee"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

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
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
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
              />
            </div>
            <div className="grid gap-2.5">
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
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2.5">
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
                />
              </div>
              <div className="grid gap-2.5">
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
                />
              </div>
            </div>
            <div className="grid gap-2.5">
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
              />
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="projects" className="text-green-800">
                Projects
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <MultiSelect
                    options={availableProjects}
                    selected={formData.projects}
                    onChange={(selected) =>
                      setFormData({ ...formData, projects: selected })
                    }
                    placeholder={
                      isProjectsLoading
                        ? "Loading projects..."
                        : isProjectsError
                          ? "Failed to load projects"
                          : "Select projects"
                    }
                    disabled={isProjectsLoading || isProjectsError}
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 border-green-200 text-green-700 hover:bg-green-50 flex-shrink-0"
                  onClick={() => setIsAddProjectDialogOpen(true)}
                  title="Add New Project"
                  disabled={isProjectsLoading || addProjectMutation.isPending}
                >
                  {addProjectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
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
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
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
            </div>
          </div>
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
