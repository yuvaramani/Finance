import { useState } from "react";
import { Button } from "./ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Plus, CalendarIcon, Filter } from "lucide-react";
import { DataTable, Column } from "./DataTable";
import { Checkbox } from "./ui/checkbox";
import { format } from "date-fns";
import { cn } from "./ui/utils";

interface SalaryEntry {
  id: number;
  date: string;
  employeeId: number;
  employeeName: string;
  netSalary: number;
  tds: number;
  grossSalary: number;
}

interface Employee {
  id: number;
  name: string;
  projects: string[];
}

// Mock data
const mockEmployees: Employee[] = [
  { id: 1, name: "John Doe", projects: ["Project Alpha", "Project Beta"] },
  { id: 2, name: "Jane Smith", projects: ["Project Gamma"] },
  { id: 3, name: "Robert Johnson", projects: ["Project Alpha", "Project Delta"] },
];

const mockSalaryData: SalaryEntry[] = [
  {
    id: 1,
    date: "2024-11-01",
    employeeId: 1,
    employeeName: "John Doe",
    netSalary: 50000,
    tds: 5000,
    grossSalary: 45000,
  },
  {
    id: 2,
    date: "2024-11-01",
    employeeId: 2,
    employeeName: "Jane Smith",
    netSalary: 60000,
    tds: 6000,
    grossSalary: 54000,
  },
];

const availableProjects = [
  "Project Alpha",
  "Project Beta",
  "Project Gamma",
  "Project Delta",
];

export function SalaryList() {
  const [salaryData, setSalaryData] = useState<SalaryEntry[]>(mockSalaryData);
  const [employees] = useState<Employee[]>(mockEmployees);
  
  // Dialog states
  const [isChoiceDialogOpen, setIsChoiceDialogOpen] = useState(false);
  const [isIndividualDialogOpen, setIsIndividualDialogOpen] = useState(false);
  const [isBatchStep1DialogOpen, setIsBatchStep1DialogOpen] = useState(false);
  const [isBatchStep2DialogOpen, setIsBatchStep2DialogOpen] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState<"date" | "resource">("date");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [selectedFilterEmployee, setSelectedFilterEmployee] = useState<string>("");
  
  // Individual form states
  const [editingEntry, setEditingEntry] = useState<SalaryEntry | null>(null);
  const [individualDate, setIndividualDate] = useState<Date>();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [netSalary, setNetSalary] = useState<string>("");
  
  // Batch form states
  const [batchProject, setBatchProject] = useState<string>("");
  const [batchDate, setBatchDate] = useState<Date>();
  const [batchEmployees, setBatchEmployees] = useState<
    { employee: Employee; salary: string; checked: boolean }[]
  >([]);

  // Calculate TDS and Gross
  const calculateTDS = (salary: number) => salary * 0.1;
  const calculateGross = (salary: number, tds: number) => salary - tds;

  // Computed values for individual form
  const currentTDS = netSalary ? calculateTDS(parseFloat(netSalary)) : 0;
  const currentGross = netSalary ? calculateGross(parseFloat(netSalary), currentTDS) : 0;

  // Calculate batch totals
  const batchTotals = batchEmployees.reduce(
    (acc, item) => {
      if (item.checked && item.salary) {
        const salary = parseFloat(item.salary) || 0;
        const tds = calculateTDS(salary);
        const net = calculateGross(salary, tds);
        return {
          salary: acc.salary + salary,
          tds: acc.tds + tds,
          net: acc.net + net,
        };
      }
      return acc;
    },
    { salary: 0, tds: 0, net: 0 }
  );

  // Handle Add New button
  const handleAddNew = () => {
    setIsChoiceDialogOpen(true);
  };

  // Handle Choice: Add Individual
  const handleChoiceIndividual = () => {
    setIsChoiceDialogOpen(false);
    setEditingEntry(null);
    setIndividualDate(undefined);
    setSelectedEmployee("");
    setNetSalary("");
    setIsIndividualDialogOpen(true);
  };

  // Handle Choice: Add Batch
  const handleChoiceBatch = () => {
    setIsChoiceDialogOpen(false);
    setBatchProject("");
    setBatchDate(undefined);
    setIsBatchStep1DialogOpen(true);
  };

  // Handle Batch Step 1 Continue
  const handleBatchStep1Continue = () => {
    if (!batchProject || !batchDate) return;
    
    // Filter employees by selected project
    const projectEmployees = employees.filter((emp) =>
      emp.projects.includes(batchProject)
    );
    
    // Initialize batch employees with all checked and empty salary
    setBatchEmployees(
      projectEmployees.map((emp) => ({
        employee: emp,
        salary: "",
        checked: true,
      }))
    );
    
    setIsBatchStep1DialogOpen(false);
    setIsBatchStep2DialogOpen(true);
  };

  // Handle Batch Step 2 Save
  const handleBatchStep2Save = () => {
    const newEntries: SalaryEntry[] = batchEmployees
      .filter((item) => item.checked && item.salary)
      .map((item) => {
        const salary = parseFloat(item.salary);
        const tds = calculateTDS(salary);
        const gross = calculateGross(salary, tds);
        
        return {
          id: Math.max(...salaryData.map((s) => s.id), 0) + 1 + Math.random(),
          date: format(batchDate!, "yyyy-MM-dd"),
          employeeId: item.employee.id,
          employeeName: item.employee.name,
          netSalary: salary,
          tds,
          grossSalary: gross,
        };
      });
    
    setSalaryData((prev) => [...prev, ...newEntries]);
    setIsBatchStep2DialogOpen(false);
  };

  // Handle Individual Save
  const handleIndividualSave = () => {
    if (!individualDate || !selectedEmployee || !netSalary) return;
    
    const salary = parseFloat(netSalary);
    const tds = calculateTDS(salary);
    const gross = calculateGross(salary, tds);
    const employee = employees.find((e) => e.id.toString() === selectedEmployee);
    
    if (editingEntry) {
      // Update existing entry
      setSalaryData((prev) =>
        prev.map((entry) =>
          entry.id === editingEntry.id
            ? {
                ...entry,
                date: format(individualDate, "yyyy-MM-dd"),
                employeeId: parseInt(selectedEmployee),
                employeeName: employee?.name || "",
                netSalary: salary,
                tds,
                grossSalary: gross,
              }
            : entry
        )
      );
    } else {
      // Add new entry
      const newEntry: SalaryEntry = {
        id: Math.max(...salaryData.map((s) => s.id), 0) + 1,
        date: format(individualDate, "yyyy-MM-dd"),
        employeeId: parseInt(selectedEmployee),
        employeeName: employee?.name || "",
        netSalary: salary,
        tds,
        grossSalary: gross,
      };
      setSalaryData((prev) => [...prev, newEntry]);
    }
    
    setIsIndividualDialogOpen(false);
  };

  // Handle Edit
  const handleEdit = (entry: SalaryEntry) => {
    setEditingEntry(entry);
    setIndividualDate(new Date(entry.date));
    setSelectedEmployee(entry.employeeId.toString());
    setNetSalary(entry.netSalary.toString());
    setIsIndividualDialogOpen(true);
  };

  // Handle Delete
  const handleDelete = (entry: SalaryEntry) => {
    setSalaryData((prev) => prev.filter((item) => item.id !== entry.id));
  };

  // Filter data
  const filteredData = salaryData.filter((entry) => {
    if (filterType === "date" && fromDate && toDate) {
      const entryDate = new Date(entry.date);
      return entryDate >= fromDate && entryDate <= toDate;
    }
    if (filterType === "resource" && selectedFilterEmployee) {
      return entry.employeeId.toString() === selectedFilterEmployee;
    }
    return true;
  });

  // Define table columns
  const columns: Column<SalaryEntry>[] = [
    {
      header: "Date",
      accessor: (row) => format(new Date(row.date), "dd MMM yyyy"),
      cellClassName: "text-green-800",
    },
    {
      header: "Employee",
      accessor: "employeeName",
      cellClassName: "text-green-800",
    },
    {
      header: "Net Salary",
      accessor: (row) => `₹${row.netSalary.toLocaleString()}`,
      cellClassName: "text-green-700",
    },
    {
      header: "TDS",
      accessor: (row) => `₹${row.tds.toLocaleString()}`,
      cellClassName: "text-red-700",
    },
    {
      header: "Gross Salary",
      accessor: (row) => `₹${row.grossSalary.toLocaleString()}`,
      cellClassName: "text-green-700",
    },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl text-green-800">Salary Management</h1>
          <p className="text-sm text-green-600 mt-1">
            Track and manage employee salary payments
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-green-600" />
          <Select value={filterType} onValueChange={(value: "date" | "resource") => setFilterType(value)}>
            <SelectTrigger className="w-[150px] border-green-200 focus:border-green-400 focus:ring-green-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="resource">Resource</SelectItem>
            </SelectContent>
          </Select>

          {filterType === "date" ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] justify-start text-left border-green-200 hover:bg-green-50",
                      !fromDate && "text-green-600"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd MMM yyyy") : "From Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] justify-start text-left border-green-200 hover:bg-green-50",
                      !toDate && "text-green-600"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd MMM yyyy") : "To Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Select value={selectedFilterEmployee} onValueChange={setSelectedFilterEmployee}>
              <SelectTrigger className="w-[250px] border-green-200 focus:border-green-400 focus:ring-green-400">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button
          onClick={handleAddNew}
          size="icon"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 w-10"
          title="Add New Salary Entry"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Salary Table */}
      <div className="flex-1 min-h-0">
        <DataTable
          data={filteredData}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No salary entries found"
          getRowKey={(row) => row.id}
          pageSize={10}
        />
      </div>

      {/* Choice Dialog */}
      <Dialog open={isChoiceDialogOpen} onOpenChange={setIsChoiceDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              Add Salary Entry
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Choose how you want to add salary entries
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <Button
              onClick={handleChoiceIndividual}
              className="h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Add Individual
            </Button>
            <Button
              onClick={handleChoiceBatch}
              className="h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              Add Batch
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Individual Dialog */}
      <Dialog open={isIndividualDialogOpen} onOpenChange={setIsIndividualDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              {editingEntry ? "Edit Salary Entry" : "Add Individual Salary"}
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              {editingEntry ? "Update salary information below" : "Fill in the details to add a salary entry"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
              <Label className="text-green-800 flex items-center gap-1.5">
                Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left border-green-200 hover:bg-green-50 h-11",
                      !individualDate && "text-green-600"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {individualDate ? format(individualDate, "dd MMM yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={individualDate}
                    onSelect={setIndividualDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2.5">
              <Label className="text-green-800 flex items-center gap-1.5">
                Employee <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2.5">
              <Label className="text-green-800 flex items-center gap-1.5">
                Net Salary <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={netSalary}
                onChange={(e) => setNetSalary(e.target.value)}
                placeholder="Enter net salary"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
              />
            </div>

            <div className="grid gap-2.5">
              <Label className="text-green-800">TDS (10%)</Label>
              <Input
                type="text"
                value={currentTDS ? `₹${currentTDS.toLocaleString()}` : "₹0"}
                readOnly
                className="border-green-200 bg-green-50/30 h-11"
              />
            </div>

            <div className="grid gap-2.5">
              <Label className="text-green-800">Gross Salary</Label>
              <Input
                type="text"
                value={currentGross ? `₹${currentGross.toLocaleString()}` : "₹0"}
                readOnly
                className="border-green-200 bg-green-50/30 h-11"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsIndividualDialogOpen(false)}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleIndividualSave}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={!individualDate || !selectedEmployee || !netSalary}
            >
              {editingEntry ? "Update Entry" : "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Step 1 Dialog */}
      <Dialog open={isBatchStep1DialogOpen} onOpenChange={setIsBatchStep1DialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              Add Batch Salary - Step 1
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Select project and date for batch salary entry
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
              <Label className="text-green-800 flex items-center gap-1.5">
                Project <span className="text-red-500">*</span>
              </Label>
              <Select value={batchProject} onValueChange={setBatchProject}>
                <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2.5">
              <Label className="text-green-800 flex items-center gap-1.5">
                Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left border-green-200 hover:bg-green-50 h-11",
                      !batchDate && "text-green-600"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {batchDate ? format(batchDate, "dd MMM yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={batchDate}
                    onSelect={setBatchDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBatchStep1DialogOpen(false)}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchStep1Continue}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={!batchProject || !batchDate}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Step 2 Dialog */}
      <Dialog open={isBatchStep2DialogOpen} onOpenChange={setIsBatchStep2DialogOpen}>
        <DialogContent className="sm:max-w-[950px] bg-white border-green-200 shadow-xl rounded-lg">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl text-green-800">
              Add Batch Salary - Step 2
            </DialogTitle>
            <DialogDescription className="text-green-600">
              Select employees and enter salary amounts
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 max-h-[550px] overflow-auto">
            <div className="border border-green-300 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-100">
                    <th className="border-r border-green-200 p-2.5 text-green-800 text-center w-[60px]">
                      <Checkbox
                        checked={batchEmployees.every((item) => item.checked)}
                        onCheckedChange={(checked) => {
                          setBatchEmployees((prev) =>
                            prev.map((item) => ({ ...item, checked: !!checked }))
                          );
                        }}
                        className="border-green-500 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                      />
                    </th>
                    <th className="border-r border-green-200 p-2.5 text-green-800 text-left">
                      Employee Name
                    </th>
                    <th className="border-r border-green-200 p-2.5 text-green-800 text-right w-[200px]">
                      Salary
                    </th>
                    <th className="border-r border-green-200 p-2.5 text-green-800 text-right w-[200px]">
                      TDS
                    </th>
                    <th className="p-2.5 text-green-800 text-right w-[200px]">
                      Net
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {batchEmployees.map((item, index) => {
                    const salary = parseFloat(item.salary) || 0;
                    const tds = salary ? calculateTDS(salary) : 0;
                    const net = salary ? calculateGross(salary, tds) : 0;

                    return (
                      <tr
                        key={item.employee.id}
                        className="border-b border-green-100 hover:bg-green-50/30 transition-colors"
                      >
                        <td className="border-r border-green-100 p-0 text-center">
                          <div className="flex items-center justify-center h-[36px]">
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={(checked) => {
                                setBatchEmployees((prev) =>
                                  prev.map((emp) =>
                                    emp.employee.id === item.employee.id
                                      ? { ...emp, checked: !!checked }
                                      : emp
                                  )
                                );
                              }}
                              className="border-green-400"
                            />
                          </div>
                        </td>
                        <td className="border-r border-green-100 px-3 py-2 text-green-900">
                          {item.employee.name}
                        </td>
                        <td className="border-r border-green-100 p-0">
                          <input
                            type="number"
                            value={item.salary}
                            onChange={(e) => {
                              setBatchEmployees((prev) =>
                                prev.map((emp) =>
                                  emp.employee.id === item.employee.id
                                    ? { ...emp, salary: e.target.value }
                                    : emp
                                )
                              );
                            }}
                            placeholder="0"
                            className="w-full h-[36px] px-3 text-right text-green-900 bg-transparent border-0 outline-none focus:bg-green-50/50 transition-colors"
                          />
                        </td>
                        <td className="border-r border-green-100 px-3 py-2 text-right text-red-600">
                          {tds ? `₹${tds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="px-3 py-2 text-right text-blue-700">
                          {net ? `₹${net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Total Row */}
                  <tr className="bg-green-100">
                    <td className="border-r border-green-200 p-2.5 text-green-800" colSpan={2}>
                      Total
                    </td>
                    <td className="border-r border-green-200 px-3 py-2.5 text-right text-green-800">
                      ₹{batchTotals.salary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border-r border-green-200 px-3 py-2.5 text-right text-green-800">
                      ₹{batchTotals.tds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5 text-right text-green-800">
                      ₹{batchTotals.net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter className="pt-6 gap-3">
            <Button
              variant="outline"
              onClick={() => setIsBatchStep2DialogOpen(false)}
              className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 h-11 px-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchStep2Save}
              className="bg-green-600 hover:bg-green-700 shadow-md h-11 px-8"
              disabled={!batchEmployees.some((item) => item.checked && item.salary)}
            >
              Add Selected Entries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}