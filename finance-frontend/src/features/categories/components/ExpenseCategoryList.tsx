
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@components/DataTable";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { useSnackbar } from "notistack";
import { expenseCategoryService } from "@api/services/expenseCategoryService";
import { ExpenseCategoryDialog } from "./ExpenseCategoryDialog";

export function ExpenseCategoryList() {
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Expense Categories
    const { data: response, isLoading, isError, error } = useQuery({
        queryKey: ["expense-categories"],
        queryFn: () => expenseCategoryService.getExpenseCategories(),
        refetchOnMount: "always",
    });

    const rawCategories =
        (response as any)?.data?.categories ||
        (response as any)?.categories ||
        (response as any)?.data ||
        (Array.isArray(response) ? response : []) ||
        [];

    const categoriesList = Array.isArray(rawCategories) ? rawCategories : [];

    const [editingCategory, setEditingCategory] = useState<any>(null);

    // Filter categories based on search
    const categories = categoriesList.filter((cat: any) =>
        (cat.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: expenseCategoryService.createExpenseCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
            enqueueSnackbar("Expense category created successfully", { variant: "success" });
            setIsDialogOpen(false);
        },
        onError: (error: any) => {
            enqueueSnackbar(error.response?.data?.message || "Failed to create expense category", { variant: "error" });
        },
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => expenseCategoryService.updateExpenseCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
            enqueueSnackbar("Expense category updated successfully", { variant: "success" });
            setIsDialogOpen(false);
            setEditingCategory(null);
        },
        onError: (error: any) => {
            enqueueSnackbar(error.response?.data?.message || "Failed to update expense category", { variant: "error" });
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => expenseCategoryService.deleteExpenseCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
            enqueueSnackbar("Expense category deleted successfully", { variant: "success" });
        },
        onError: (error: any) => {
            enqueueSnackbar("Failed to delete expense category", { variant: "error" });
        },
    });

    const handleSubmit = (data: any) => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (row: any) => {
        setEditingCategory(row);
        setIsDialogOpen(true);
    };

    const handleDelete = (row: any) => {
        if (confirm("Are you sure you want to delete this category?")) {
            deleteMutation.mutate(Number(row.id));
        }
    };

    // Reset state when dialog closes
    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingCategory(null);
        }
    };

    const columns: any[] = [
        {
            header: "Category Name",
            accessor: "name",
            cellClassName: "text-red-800 font-medium",
            cell: ({ row }: any) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-red-100 text-red-700">
                        <Tag className="w-3 h-3" />
                    </div>
                    <span className="font-medium text-red-800">{row.name}</span>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col h-full w-full flex-1 gap-6 overflow-hidden">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl text-red-800">Expense Categories</h1>
                    <p className="text-sm text-red-600 mt-1">
                        Manage your expense categories
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search expense categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-4 border-red-200 focus:border-red-400 focus:ring-red-400"
                    />
                </div>
                <Button
                    onClick={() => {
                        setEditingCategory(null);
                        setIsDialogOpen(true);
                    }}
                    size="icon"
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 h-10 w-10 shadow-md"
                    title="Add Category"
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 min-h-0">
                {isLoading ? (
                    <div className="h-full border border-red-100 rounded flex items-center justify-center">
                        <div className="flex items-center gap-3 text-red-700">
                            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                            <span>Loading...</span>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="h-full border border-red-200 rounded bg-red-50 p-4 text-red-700">
                        <p className="font-medium">Error loading categories</p>
                        <p className="text-sm mt-1">{(error as any)?.message}</p>
                    </div>
                ) : (
                    <DataTable
                        data={categories}
                        columns={columns}
                        getRowKey={(row: any) => row.id}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        emptyMessage="No expense categories found"
                    />
                )}
            </div>

            <ExpenseCategoryDialog
                open={isDialogOpen}
                onOpenChange={handleOpenChange}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                initialData={editingCategory}
            />
        </div>
    );
}
