import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
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
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { groupService } from "@api/services/groupService";

interface Group {
  id: number;
  name: string;
}

export function GroupList() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
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

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({ name: group.name });
    setIsDialogOpen(true);
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

  return (
    <div className="space-y-6">
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="ml-3 text-green-700">Loading groups...</span>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading groups</p>
          <p className="text-sm mt-1">{(error as any)?.message || "Please try again."}</p>
        </div>
      ) : (
        <div className="border border-green-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50/50 hover:bg-green-50/50">
                <TableHead className="text-green-800">Group Name</TableHead>
                <TableHead className="text-green-800 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-green-600">
                    No groups found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group) => (
                  <TableRow
                    key={group.id}
                    className="group hover:bg-green-50/30 transition-colors cursor-pointer [&:hover_.action-buttons]:opacity-100"
                    onDoubleClick={() => handleEdit(group)}
                  >
                    <TableCell className="text-green-800">{group.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 action-buttons opacity-0 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-700 hover:bg-green-50 hover:text-green-800"
                          onClick={() => handleEdit(group)}
                          title="Edit Group"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(group)}
                          title="Delete Group"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

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
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
              <Label className="text-green-800 flex items-center gap-1.5">
                Group Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Enter group name"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
              />
            </div>
          </div>
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

