import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { groupService } from "@api/services/groupService";
import { Grid, GridItem } from "@components/common/Grid";
import { DataTable, Column } from "@components/DataTable";

interface Group {
  id: number;
  name: string;
}

export function GroupList() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "" });

  const {
    data: groupsData,
    isLoading,
    isError,
    error,
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

  const groups: Group[] = Array.isArray(groupsRaw) ? groupsRaw : [];

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => groupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      enqueueSnackbar("Group added successfully", { variant: "success" });
      resetDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to add group", { variant: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      groupService.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      enqueueSnackbar("Group updated successfully", { variant: "success" });
      resetDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to update group", { variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => groupService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      enqueueSnackbar("Group deleted successfully", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to delete group", { variant: "error" });
    },
  });

  const handleAddNew = () => {
    setEditingGroup(null);
    setFormData({ name: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = async (group: Group) => {
    setIsLoadingGroup(true);
    setIsDialogOpen(true);

    try {
      // Fetch fresh group data from the API
      const response = await groupService.getGroup(group.id);
      const freshGroupData = response?.data?.group || response?.group || response;

      setEditingGroup(freshGroupData);
      setFormData({ name: freshGroupData.name || "" });
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Failed to load group data", { variant: "error" });
      setIsDialogOpen(false);
    } finally {
      setIsLoadingGroup(false);
    }
  };

  const handleDelete = (group: Group) => {
    if (window.confirm(`Delete group "${group.name}"?`)) {
      deleteMutation.mutate(group.id);
    }
  };

  const handleSave = () => {
    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditingGroup(null);
    setFormData({ name: "" });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const columns: Column<Group>[] = [
    {
      header: "Group Name",
      accessor: "name",
      cellClassName: "text-green-800",
    },
  ];

  return (
    <div className="flex flex-col h-full w-full flex-1 gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-green-800">Groups</h1>
          <p className="text-sm text-green-600 mt-1">
            Organize accounts by maintaining your master group list
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
          />
        </div>
        <Button
          onClick={handleAddNew}
          size="icon"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 w-10"
          title="Add Group"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full border border-green-100 rounded flex items-center justify-center">
            <div className="flex items-center gap-3 text-green-700">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              <span>Loading groups...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="h-full border border-red-200 rounded bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error loading groups</p>
            <p className="text-sm mt-1">{(error as any)?.message || "Please try again."}</p>
          </div>
        ) : (
          <DataTable
            data={filteredGroups}
            columns={columns}
            getRowKey={(group) => group.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowDoubleClick={handleEdit}
            emptyMessage="No groups found"
          />
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[420px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              {editingGroup ? "Edit Group" : "Add Group"}
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              {editingGroup ? "Update the group name" : "Provide the group details"}
            </DialogDescription>
          </DialogHeader>
          <Grid>
            <GridItem>
              <Label className="text-green-800 flex items-center gap-1.5">
                Group Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Enter group name"
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
              ) : editingGroup ? (
                "Update Group"
              ) : (
                "Add Group"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

