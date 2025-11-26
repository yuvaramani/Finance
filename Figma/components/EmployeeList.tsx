import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Pencil, Archive, Search } from "lucide-react";
import { MultiSelect } from "./MultiSelect";

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

// Mock data
const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "John Doe",
    accName: "John Doe",
    accNumber: "1234567890",
    ifscCode: "HDFC0001234",
    panNo: "ABCDE1234F",
    projects: ["Project Alpha", "Project Beta"],
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    accName: "Jane Smith",
    accNumber: "0987654321",
    ifscCode: "ICIC0005678",
    panNo: "XYZAB5678C",
    projects: ["Project Gamma"],
    status: "active",
  },
  {
    id: 3,
    name: "Robert Johnson",
    accName: "Robert Johnson",
    accNumber: "5678901234",
    ifscCode: "SBIN0009012",
    panNo: "PQRST9012D",
    projects: ["Project Alpha", "Project Delta"],
    status: "active",
  },
];

const availableProjects = [
  "Project Alpha",
  "Project Beta",
  "Project Gamma",
  "Project Delta",
  "Project Epsilon",
  "Project Zeta",
];

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [projects, setProjects] = useState<string[]>(availableProjects);
  const [formData, setFormData] = useState({
    name: "",
    accName: "",
    accNumber: "",
    ifscCode: "",
    panNo: "",
    projects: [] as string[],
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
      projects: employee.projects,
    });
    setIsDialogOpen(true);
  };

  const handleArchive = (id: number) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, status: "archived" as const } : emp
      )
    );
  };

  const handleSave = () => {
    if (editingEmployee) {
      // Update existing employee
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id
            ? { ...emp, ...formData }
            : emp
        )
      );
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: Math.max(...employees.map((e) => e.id), 0) + 1,
        ...formData,
        status: "active",
      };
      setEmployees((prev) => [...prev, newEmployee]);
    }
    setIsDialogOpen(false);
  };

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      setProjects((prev) => [...prev, newProjectName.trim()]);
      setNewProjectName("");
      setIsAddProjectDialogOpen(false);
    }
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

      {/* Employee Table */}
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
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="hover:bg-green-50/30 transition-colors [&:hover_.action-buttons]:opacity-100"
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
                        {employee.projects.map((project, idx) => (
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
                    options={projects}
                    selected={formData.projects}
                    onChange={(selected) =>
                      setFormData({ ...formData, projects: selected })
                    }
                    placeholder="Select projects"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 border-green-200 text-green-700 hover:bg-green-50 flex-shrink-0"
                  onClick={() => setIsAddProjectDialogOpen(true)}
                  title="Add New Project"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
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
                !formData.name ||
                !formData.accName ||
                !formData.accNumber ||
                !formData.ifscCode ||
                !formData.panNo
              }
            >
              {editingEmployee ? "Update Employee" : "Add Employee"}
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
              Enter the name of the new project
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
              />
            </div>
          </div>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddProjectDialogOpen(false)}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProject}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={!newProjectName.trim()}
            >
              Add Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
