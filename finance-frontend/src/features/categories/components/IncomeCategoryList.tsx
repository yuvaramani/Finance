
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@components/DataTable";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { useSnackbar } from "notistack";
import { incomeSourceService } from "@api/services/incomeSourceService";
import { IncomeCategoryDialog } from "./IncomeCategoryDialog";

export function IncomeCategoryList() {
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Income Sources
    // Fetch Income Sources
    const { data: response, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["incomeSources"],
        queryFn: () => incomeSourceService.getIncomeSources(),
        refetchOnMount: "always",
    });

    // Extract sources from response - handle both direct response and nested data structure
    console.log("Income Sources API Response:", response);
    const rawCategories =
        (response as any)?.data?.sources ||
        (response as any)?.sources ||
        (response as any)?.data ||
        (Array.isArray(response) ? response : []) ||
        [];
    console.log("Extracted Categories:", rawCategories);

    const categoriesList = Array.isArray(rawCategories) ? rawCategories : [];

    const [editingSource, setEditingSource] = useState<any>(null);

    // Filter categories based on search
    const categories = categoriesList.filter((cat: any) =>
        (cat.name || cat.source_name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: incomeSourceService.createIncomeSource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incomeSources"] });
            enqueueSnackbar("Income source created successfully", { variant: "success" });
            setIsDialogOpen(false);
        },
        onError: (error: any) => {
            enqueueSnackbar(error.response?.data?.message || "Failed to create income source", { variant: "error" });
        },
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => incomeSourceService.updateIncomeSource(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incomeSources"] });
            enqueueSnackbar("Income source updated successfully", { variant: "success" });
            setIsDialogOpen(false);
            setEditingSource(null);
        },
        onError: (error: any) => {
            enqueueSnackbar(error.response?.data?.message || "Failed to update income source", { variant: "error" });
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => {
            console.log("Mutation: Calling delete API for ID:", id);
            return incomeSourceService.deleteIncomeSource(id);
        },
        onSuccess: (data) => {
            console.log("Mutation: Delete successful, response:", data);
            queryClient.invalidateQueries({ queryKey: ["incomeSources"] });
            enqueueSnackbar("Income source deleted successfully", { variant: "success" });
        },
        onError: (error: any) => {
            console.error("Mutation: Delete failed", error);
            enqueueSnackbar("Failed to delete income source", { variant: "error" });
        },
    });

    const handleSubmit = (data: any) => {
        if (editingSource) {
            updateMutation.mutate({ id: editingSource.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (row: any) => {
        setEditingSource(row);
        setIsDialogOpen(true);
    };

    const handleDelete = (row: any) => {
        console.log("UI: Delete button clicked for row:", row);
        if (confirm("Are you sure you want to delete this source?")) {
            const id = Number(row.id);
            console.log("UI: Confirming delete for ID:", id);
            deleteMutation.mutate(id);
        }
    };

    // Reset state when dialog closes
    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingSource(null);
        }
    };

    const columns: any[] = [
        {
            header: "Source Name",
            accessor: "name",
            cellClassName: "text-green-800 font-medium",
            cell: ({ row }: any) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-green-100 text-green-700">
                        <Tag className="w-3 h-3" />
                    </div>
                    <span className="font-medium text-green-800">{row.name || row.source_name}</span>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col h-full w-full flex-1 gap-6 overflow-hidden">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl text-green-800">Income Sources</h1>
                    <p className="text-sm text-green-600 mt-1">
                        Manage your income sources
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search income sources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-4 border-green-200 focus:border-green-400 focus:ring-green-400"
                    />
                </div>
                <Button
                    onClick={() => {
                        setEditingSource(null);
                        setIsDialogOpen(true);
                    }}
                    size="icon"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 w-10 shadow-md"
                    title="Add Source"
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 min-h-0">
                {isLoading ? (
                    <div className="h-full border border-green-100 rounded flex items-center justify-center">
                        <div className="flex items-center gap-3 text-green-700">
                            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                            <span>Loading...</span>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="h-full border border-red-200 rounded bg-red-50 p-4 text-red-700">
                        <p className="font-medium">Error loading sources</p>
                        <p className="text-sm mt-1">{(error as any)?.message}</p>
                    </div>
                ) : (
                    <DataTable
                        data={categories}
                        columns={columns}
                        getRowKey={(row: any) => row.id}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        emptyMessage="No income sources found"
                    />
                )}
            </div>

            <IncomeCategoryDialog
                open={isDialogOpen}
                onOpenChange={handleOpenChange}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                initialData={editingSource}
            />
        </div>
    );
}
