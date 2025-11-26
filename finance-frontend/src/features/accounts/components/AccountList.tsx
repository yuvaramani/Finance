import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button } from "@components/ui/button";
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
import {
  Loader2,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { accountService } from "@api/services/accountService";
import { groupService } from "@api/services/groupService";
import { StyledSelect } from "@components/StyledSelect";

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Archive", value: "Archive" },
];

type AccountPayload = {
  group_id: number;
  name: string;
  status?: string;
  balance?: number;
};

export function AccountList() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    group_id: "",
    name: "",
    status: "Active",
    balance: "0",
  });
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const {
    data: accountsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["accounts", { search: searchQuery }],
    queryFn: () =>
      accountService.getAccounts({
        search: searchQuery,
        per_page: 100,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const rawAccounts =
    accountsData?.data?.accounts ||
    accountsData?.accounts ||
    accountsData?.data ||
    accountsData ||
    [];

  const accounts = Array.isArray(rawAccounts)
    ? rawAccounts
    : Array.isArray(rawAccounts?.data)
      ? rawAccounts.data
      : [];

  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    isError: isGroupsError,
  } = useQuery<any>({
    queryKey: ["groups"],
    queryFn: groupService.getGroups,
    staleTime: 10 * 60 * 1000,
  });

  const groups =
    groupsData?.data?.groups ||
    groupsData?.groups ||
    groupsData?.data ||
    groupsData ||
    [];

  const createMutation = useMutation<any, any, AccountPayload>({
    mutationFn: accountService.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      enqueueSnackbar("Account created successfully", { variant: "success" });
      resetDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to create account", { variant: "error" });
    },
  });

  const addGroupMutation = useMutation({
    mutationFn: (data: { name: string }) => groupService.createGroup(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      const created = (data as any)?.data?.group || (data as any)?.group || data;
      if (created?.id) {
        setFormData((prev) => ({
          ...prev,
          group_id: created.id.toString(),
        }));
      }
      setNewGroupName("");
      setIsAddGroupDialogOpen(false);
      enqueueSnackbar("Group added successfully", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to add group", { variant: "error" });
    },
  });

  const updateMutation = useMutation<any, any, { id: number; data: AccountPayload }>({
    mutationFn: ({ id, data }) =>
      accountService.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      enqueueSnackbar("Account updated successfully", { variant: "success" });
      resetDialog();
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to update account", { variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      enqueueSnackbar("Account deleted successfully", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to delete account", { variant: "error" });
    },
  });

  const handleAddNew = () => {
    setEditingAccount(null);
    setFormData({
      group_id: "",
      name: "",
      status: "Active",
      balance: "0",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      group_id: account.group_id?.toString() ?? "",
      name: account.name ?? "",
      status: account.status ?? "Active",
      balance: account.balance?.toString() ?? "0",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (account: any) => {
    if (window.confirm(`Delete account "${account.name}"?`)) {
      deleteMutation.mutate(account.id);
    }
  };

  const handleSave = () => {
    const payload: AccountPayload = {
      group_id: Number(formData.group_id),
      name: formData.name,
      status: formData.status,
      balance: Number(formData.balance || 0),
    };

    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditingAccount(null);
    setFormData({
      group_id: "",
      name: "",
      status: "Active",
      balance: "0",
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-green-800">Accounts</h1>
          <p className="text-sm text-green-600 mt-1">
            Create and manage the accounts you use for transactions
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 border-green-200 focus:border-green-400 focus:ring-green-400"
          />
        </div>
        <Button
          onClick={handleAddNew}
          size="icon"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 w-10"
          title="Add Account"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="ml-3 text-green-700">Loading accounts...</span>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading accounts</p>
          <p className="text-sm mt-1">{(error as any)?.message || "Please try again."}</p>
        </div>
      ) : (
        <div className="border border-green-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50/50 hover:bg-green-50/50">
                <TableHead className="text-green-800">Account Name</TableHead>
                <TableHead className="text-green-800">Group</TableHead>
                <TableHead className="text-green-800">Balance</TableHead>
                <TableHead className="text-green-800">Status</TableHead>
                <TableHead className="text-green-800 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-green-600">
                    No accounts found
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account: any) => (
                  <TableRow
                    key={account.id}
                    className="group hover:bg-green-50/30 transition-colors cursor-pointer [&:hover_.action-buttons]:opacity-100"
                    onDoubleClick={() => handleEdit(account)}
                  >
                    <TableCell className="text-green-800">{account.name}</TableCell>
                    <TableCell className="text-green-700">
                      {account.group_name || "—"}
                    </TableCell>
                    <TableCell className="text-green-700 font-semibold">
                      ₹{Number(account.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-green-700">
                      {account.status}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 action-buttons opacity-0 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-700 hover:bg-green-50 hover:text-green-800"
                          onClick={() => handleEdit(account)}
                          title="Edit Account"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(account)}
                          title="Delete Account"
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
        <DialogContent className="sm:max-w-[520px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              {editingAccount ? "Edit Account" : "Add Account"}
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Provide the account information below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
              <Label className="text-green-800 flex items-center gap-1.5">
                Group <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <StyledSelect
                  value={formData.group_id}
                  onChange={(value) => setFormData({ ...formData, group_id: value })}
                  placeholder="- Select -"
                  disabled={isGroupsLoading || isGroupsError}
                  options={groups.map((group: any) => ({
                    value: group.id?.toString(),
                    label: group.name,
                  }))}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 border-green-200 text-green-700 hover:bg-green-50 flex-shrink-0"
                  onClick={() => setIsAddGroupDialogOpen(true)}
                  disabled={addGroupMutation.isPending}
                  title="Add Group"
                >
                  {addGroupMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "+"
                  )}
                </Button>
              </div>
            </div>

            <div className="grid gap-2.5">
              <Label className="text-green-800 flex items-center gap-1.5">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="For ex: My Wallet, Bank Account"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
              />
            </div>

            <div className="grid gap-2.5">
              <Label className="text-green-800">Status</Label>
              <StyledSelect
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
                options={statusOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Active</strong>: You can add transactions like Income, Expense, and Transfers to this account.</p>
                <p><strong>Archive</strong>: Archived accounts cannot be edited or used for new transactions.</p>
              </div>
            </div>

            <div className="grid gap-2.5">
              <Label className="text-green-800">Balance</Label>
              <Input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
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
              Reset
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={
                isSaving ||
                !formData.group_id ||
                !formData.name.trim()
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white border-green-200 shadow-xl rounded-sm">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800 text-xl">
              Add New Group
            </DialogTitle>
            <DialogDescription className="text-green-600 text-sm">
              Enter the name of the new group
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
              <Label className="text-green-800 flex items-center gap-1.5">
                Group Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
                disabled={addGroupMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter className="border-t border-green-100 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddGroupDialogOpen(false)}
              className="border-green-200 text-green-700 hover:bg-green-50 h-11 px-6"
              disabled={addGroupMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => addGroupMutation.mutate({ name: newGroupName.trim() })}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md h-11 px-6"
              disabled={!newGroupName.trim() || addGroupMutation.isPending}
            >
              {addGroupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
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


