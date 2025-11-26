import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button } from "@components/ui/button";
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
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { projectService } from "@api/services/projectService";
import { Grid, GridItem } from "@components/common/Grid";
import { DataTable, Column } from "@components/DataTable";

interface Project {
  id: number;
  name: string;
  status: string;
}

export function ProjectList() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
  });

  const {
    data: projectsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["projects", { search: searchQuery }],
    queryFn: () =>
      projectService.getProjects({
        search: searchQuery,
        status: "active",
        per_page: 1000,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const projects: Project[] =
    projectsData?.data?.projects ||
    projectsData?.projects ||
    projectsData?.data ||
    projectsData ||
    [];

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      enqueueSnackbar("Project added successfully", { variant: "success" });
      resetDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to add project", { variant: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      projectService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      enqueueSnackbar("Project updated successfully", { variant: "success" });
      resetDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to update project", { variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      enqueueSnackbar("Project deleted successfully", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to delete project", { variant: "error" });
    },
  });

  const handleAddNew = () => {
    setEditingProject(null);
    setFormData({ name: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = async (project: Project) => {
    setIsLoadingProject(true);
    setIsDialogOpen(true);
    
    try {
      // Fetch fresh project data from the API
      const response = await projectService.getProject(project.id);
      const freshProjectData = response?.data?.project || response?.project || response;
      
      setEditingProject(freshProjectData);
      setFormData({ name: freshProjectData.name || "" });
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Failed to load project data", { variant: "error" });
      setIsDialogOpen(false);
    } finally {
      setIsLoadingProject(false);
    }
  };

  const handleDelete = (project: Project) => {
    if (window.confirm(`Delete project "${project.name}"?`)) {
      deleteMutation.mutate(project.id);
    }
  };

  const handleSave = () => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
    setFormData({ name: "" });
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const columns: Column<Project>[] = [
    {
      header: "Project Name",
      accessor: "name",
      cellClassName: "text-green-800",
    },
    {
      header: "Status",
      accessor: (project) => (project.status || "active").charAt(0).toUpperCase() + (project.status || "active").slice(1),
      cellClassName: "text-green-700 capitalize",
    },
  ];

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-green-800">Projects</h1>
          <p className="text-sm text-green-600 mt-1">
            Manage the list of projects available in the system
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
          />
        </div>
        <Button
          onClick={handleAddNew}
          size="icon"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 w-10"
          title="Add Project"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full border border-green-100 rounded flex items-center justify-center">
            <div className="flex items-center gap-3 text-green-700">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              <span>Loading projects...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="h-full border border-red-200 rounded bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error loading projects</p>
            <p className="text-sm mt-1">{(error as any)?.message || "Please try again."}</p>
          </div>
        ) : (
          <DataTable
            data={filteredProjects}
            columns={columns}
            getRowKey={(project) => project.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowDoubleClick={handleEdit}
            emptyMessage="No projects found"
          />
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              {editingProject ? "Edit Project" : "Add Project"}
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              {editingProject
                ? "Update the project details"
                : "Provide the project information"}
            </DialogDescription>
          </DialogHeader>
          <Grid>
            <GridItem>
              <Label htmlFor="projectName" className="text-green-800 flex items-center gap-1.5">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
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
              disabled={isSaving || !formData.name.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingProject ? (
                "Update Project"
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


