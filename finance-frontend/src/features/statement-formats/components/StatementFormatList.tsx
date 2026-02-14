import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button } from "@components/ui/button";
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
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";
import { Grid, GridItem } from "@components/common/Grid";
import { statementFormatService } from "@api/services/statementFormatService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

interface StatementFormat {
    id: number;
    bankName: string;
    dateColumn: string;
    descriptionColumn: string;
    transactionIdColumn?: string;
    amountFormat: "separate_debit_credit" | "drcr_with_amount";
    debitColumn?: string;
    creditColumn?: string;
    amountColumn?: string;
    drcrColumn?: string;
    debitTextTokens?: string;
    creditTextTokens?: string;
}

export function StatementFormatList() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFormat, setEditingFormat] = useState<StatementFormat | null>(null);
    const [formData, setFormData] = useState({
        bankName: "",
        dateColumn: "",
        descriptionColumn: "",
        transactionIdColumn: "",
        amountFormat: "separate_debit_credit" as StatementFormat["amountFormat"],
        debitColumn: "",
        creditColumn: "",
        amountColumn: "",
        drcrColumn: "",
        debitTextTokens: "",
        creditTextTokens: "",
    });

    // Fetch formats
    const {
        data: formatsData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["statementFormats"],
        queryFn: statementFormatService.getFormats,
    });

    const formats: StatementFormat[] = (formatsData as any)?.data?.formats || [];

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: Omit<StatementFormat, "id">) =>
            statementFormatService.createFormat(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["statementFormats"] });
            enqueueSnackbar("Statement format added successfully!", { variant: "success" });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: () => {
            enqueueSnackbar("Failed to add statement format", { variant: "error" });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<StatementFormat> }) =>
            statementFormatService.updateFormat(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["statementFormats"] });
            enqueueSnackbar("Statement format updated successfully!", { variant: "success" });
            setIsDialogOpen(false);
            setEditingFormat(null);
            resetForm();
        },
        onError: () => {
            enqueueSnackbar("Failed to update statement format", { variant: "error" });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => statementFormatService.deleteFormat(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["statementFormats"] });
            enqueueSnackbar("Statement format deleted successfully!", { variant: "success" });
        },
        onError: () => {
            enqueueSnackbar("Failed to delete statement format", { variant: "error" });
        },
    });

    const resetForm = () => {
        setFormData({
            bankName: "",
            dateColumn: "",
            descriptionColumn: "",
            transactionIdColumn: "",
            amountFormat: "separate_debit_credit",
            debitColumn: "",
            creditColumn: "",
            amountColumn: "",
            drcrColumn: "",
            debitTextTokens: "",
            creditTextTokens: "",
        });
    };

    const handleAddNew = () => {
        setEditingFormat(null);
        resetForm();
        setIsDialogOpen(true);
    };

    const handleEdit = (format: StatementFormat) => {
        setEditingFormat(format);
        setFormData({
            bankName: format.bankName,
            dateColumn: format.dateColumn,
            descriptionColumn: format.descriptionColumn,
            transactionIdColumn: format.transactionIdColumn || "",
            amountFormat: format.amountFormat || "separate_debit_credit",
            debitColumn: format.debitColumn || "",
            creditColumn: format.creditColumn || "",
            amountColumn: format.amountColumn || "",
            drcrColumn: format.drcrColumn || "",
            debitTextTokens: format.debitTextTokens || "",
            creditTextTokens: format.creditTextTokens || "",
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this format?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleSave = () => {
        if (editingFormat) {
            updateMutation.mutate({
                id: editingFormat.id,
                data: formData,
            });
        } else {
            createMutation.mutate(formData);
        }
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const isSeparate = formData.amountFormat === "separate_debit_credit";
    const isDrCr = formData.amountFormat === "drcr_with_amount";
    const isFormValid =
        !!formData.bankName.trim() &&
        !!formData.dateColumn.trim() &&
        !!formData.descriptionColumn.trim() &&
        (
            (isSeparate && !!formData.debitColumn.trim() && !!formData.creditColumn.trim()) ||
            (isDrCr &&
                !!formData.amountColumn.trim() &&
                !!formData.drcrColumn.trim() &&
                !!formData.debitTextTokens.trim() &&
                !!formData.creditTextTokens.trim())
        );

    const columns: Column<StatementFormat>[] = [
        {
            header: "Bank Name",
            accessor: "bankName",
            cellClassName: "text-green-800 font-medium",
        },
        {
            header: "Date Col",
            accessor: "dateColumn",
            cellClassName: "text-green-700",
        },
        {
            header: "Desc Col",
            accessor: "descriptionColumn",
            cellClassName: "text-green-700",
        },
        {
            header: "Amount Format",
            accessor: "amountFormat",
            cellClassName: "text-green-700",
        },
        {
            header: "Debit Col",
            accessor: "debitColumn",
            cellClassName: "text-green-700",
        },
        {
            header: "Credit Col",
            accessor: "creditColumn",
            cellClassName: "text-green-700",
        },
        {
            header: "Amount Col",
            accessor: "amountColumn",
            cellClassName: "text-green-700",
        },
        {
            header: "Dr/Cr Col",
            accessor: "drcrColumn",
            cellClassName: "text-green-700",
        },
        {
            header: "Trans ID Col",
            accessor: "transactionIdColumn",
            cellClassName: "text-green-700",
        },
    ];

    return (
        <div className="flex flex-col h-full w-full flex-1 gap-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl text-green-800">Statement Formats</h1>
                    <p className="text-sm text-green-600 mt-1">
                        Define Excel column mappings for bank statements
                    </p>
                </div>
                <Button
                    onClick={handleAddNew}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Format
                </Button>
            </div>

            {/* Table Container */}
            <div className="flex-1 min-h-0">
                {isLoading ? (
                    <div className="h-full border border-green-100 rounded flex items-center justify-center">
                        <div className="flex items-center gap-3 text-green-700">
                            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                            <span>Loading formats...</span>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="h-full border border-red-200 rounded bg-red-50 p-4 text-red-700">
                        <p className="font-medium">Error loading formats</p>
                        <p className="text-sm mt-1">{(error as any)?.message}</p>
                    </div>
                ) : (
                    <DataTable
                        data={formats}
                        columns={columns}
                        getRowKey={(format) => format.id}
                        onEdit={handleEdit}
                        onDelete={(format) => handleDelete(format.id)}
                        emptyMessage="No statement formats defined. Click 'Add Format' to create one."
                    />
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white border-green-200 shadow-xl rounded-sm">
                    <DialogHeader className="border-b border-green-100 pb-4">
                        <DialogTitle className="text-green-800 text-xl flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {editingFormat ? "Edit Format" : "New Statement Format"}
                        </DialogTitle>
                        <DialogDescription className="text-green-600 text-sm">
                            Map the Excel column headers for this bank's statement
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="bankName" className="text-green-800 flex items-center gap-1.5">
                                Bank Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="bankName"
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                placeholder="e.g. HDFC Bank, Chase, etc."
                                className="border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="dateColumn" className="text-green-800">Date Column Header</Label>
                                <Input
                                    id="dateColumn"
                                    value={formData.dateColumn}
                                    onChange={(e) => setFormData({ ...formData, dateColumn: e.target.value })}
                                    placeholder="e.g. Transaction Date"
                                    className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="descriptionColumn" className="text-green-800">Description Column Header</Label>
                                <Input
                                    id="descriptionColumn"
                                    value={formData.descriptionColumn}
                                    onChange={(e) => setFormData({ ...formData, descriptionColumn: e.target.value })}
                                    placeholder="e.g. Narration"
                                    className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-green-800">Amount Format <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.amountFormat}
                                onValueChange={(value: StatementFormat["amountFormat"]) =>
                                    setFormData({ ...formData, amountFormat: value })
                                }
                            >
                                <SelectTrigger className="border-green-200 focus:ring-green-400 h-11">
                                    <SelectValue placeholder="Select amount format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="separate_debit_credit">Separate Debit & Credit Columns</SelectItem>
                                    <SelectItem value="drcr_with_amount">Single Amount + Dr/Cr Indicator</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-green-600">
                                Choose how amounts are represented in the statement.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="transactionIdColumn" className="text-green-800">Transaction ID Column Header</Label>
                            <Input
                                id="transactionIdColumn"
                                value={formData.transactionIdColumn}
                                onChange={(e) => setFormData({ ...formData, transactionIdColumn: e.target.value })}
                                placeholder="e.g. Transaction ID"
                                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            />
                        </div>

                        {isSeparate && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="debitColumn" className="text-green-800">Debit Column Header</Label>
                                    <Input
                                        id="debitColumn"
                                        value={formData.debitColumn}
                                        onChange={(e) => setFormData({ ...formData, debitColumn: e.target.value })}
                                        placeholder="e.g. Withdrawal Amount"
                                        className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="creditColumn" className="text-green-800">Credit Column Header</Label>
                                    <Input
                                        id="creditColumn"
                                        value={formData.creditColumn}
                                        onChange={(e) => setFormData({ ...formData, creditColumn: e.target.value })}
                                        placeholder="e.g. Deposit Amount"
                                        className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                    />
                                </div>
                            </div>
                        )}

                        {isDrCr && (
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="amountColumn" className="text-green-800">Amount Column Header</Label>
                                        <Input
                                            id="amountColumn"
                                            value={formData.amountColumn}
                                            onChange={(e) => setFormData({ ...formData, amountColumn: e.target.value })}
                                            placeholder="e.g. Amount"
                                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="drcrColumn" className="text-green-800">Dr/Cr Column Header</Label>
                                        <Input
                                            id="drcrColumn"
                                            value={formData.drcrColumn}
                                            onChange={(e) => setFormData({ ...formData, drcrColumn: e.target.value })}
                                            placeholder="e.g. Dr/Cr"
                                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="debitTextTokens" className="text-green-800">Debit Text(s)</Label>
                                        <Input
                                            id="debitTextTokens"
                                            value={formData.debitTextTokens}
                                            onChange={(e) => setFormData({ ...formData, debitTextTokens: e.target.value })}
                                            placeholder="e.g. Dr, Debit, Withdrawal"
                                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="creditTextTokens" className="text-green-800">Credit Text(s)</Label>
                                        <Input
                                            id="creditTextTokens"
                                            value={formData.creditTextTokens}
                                            onChange={(e) => setFormData({ ...formData, creditTextTokens: e.target.value })}
                                            placeholder="e.g. Cr, Credit, Deposit"
                                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-green-600">
                                    Use comma-separated values. Matching is case-insensitive.
                                </p>
                            </div>
                        )}
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
                            disabled={isSaving || !isFormValid}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Format"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
