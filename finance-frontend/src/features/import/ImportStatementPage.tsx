
import { useState } from "react";
import { useSnackbar } from "notistack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import { Upload, FileCheck, Save, Loader2, FileSpreadsheet } from "lucide-react";
import { EditableDataGrid } from "@components/EditableDataGrid";
import { statementFormatService } from "@api/services/statementFormatService";
import { statementService } from "@api/services/statementService";
import { expenseCategoryService } from "@api/services/expenseCategoryService";
import { incomeSourceService } from "@api/services/incomeSourceService";
import { accountService } from "@api/services/accountService";

export default function ImportStatementPage() {
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [selectedFormatId, setSelectedFormatId] = useState<string>("");
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [isParsing, setIsParsing] = useState(false);

    // Fetch Accounts
    const { data: accountsData } = useQuery({
        queryKey: ["accounts", "dropdown"],
        queryFn: () => accountService.getAccounts({ per_page: 500 }),
    });
    const accountsRaw =
        (accountsData as any)?.data?.accounts ||
        (accountsData as any)?.accounts ||
        (accountsData as any)?.data ||
        accountsData ||
        [];

    const accounts = Array.isArray(accountsRaw)
        ? accountsRaw
        : Array.isArray((accountsRaw as any)?.data)
            ? (accountsRaw as any).data
            : [];

    // Fetch formats
    const { data: formatsData } = useQuery({
        queryKey: ["statementFormats"],
        queryFn: statementFormatService.getFormats,
    });
    const formats = (formatsData as any)?.data?.formats || [];

    // Fetch Categories
    const { data: expenseCatsData } = useQuery({
        queryKey: ["expenseCategories"],
        queryFn: () => expenseCategoryService.getExpenseCategories(),
    });
    // API returns { categories: [...] }
    const expenseCategories =
        (expenseCatsData as any)?.data?.categories ||
        (expenseCatsData as any)?.categories ||
        (expenseCatsData as any)?.data ||
        (Array.isArray(expenseCatsData) ? expenseCatsData : []) ||
        [];

    const { data: incomeSourcesData } = useQuery({
        queryKey: ["incomeSources"],
        queryFn: () => incomeSourceService.getIncomeSources(),
    });
    // API returns { sources: [...] }
    const incomeSources =
        (incomeSourcesData as any)?.data?.sources ||
        (incomeSourcesData as any)?.sources ||
        (incomeSourcesData as any)?.data ||
        (Array.isArray(incomeSourcesData) ? incomeSourcesData : []) ||
        [];

    // Mutations
    const createCategoryMutation = useMutation({
        mutationFn: async ({ name, type }: { name: string; type: 'income' | 'expense' }) => {
            if (type === 'income') {
                return incomeSourceService.createIncomeSource({ name });
            } else {
                return expenseCategoryService.createExpenseCategory({ name });
            }
        },
        onSuccess: (data, variables) => {
            const typeKey = variables.type === 'income' ? 'incomeSources' : 'expenseCategories';
            queryClient.invalidateQueries({ queryKey: [typeKey] });
            enqueueSnackbar(`${variables.name} category created`, { variant: 'success' });
        }
    });

    // Parse Mutation
    const parseMutation = useMutation({
        mutationFn: async (data: { file: File; format: any }) => {
            return statementService.parseStatement(data.file, data.format);
        },
        onSuccess: (response: any) => {
            console.log("Parse API Response:", response);

            let transactions: any[] = [];

            // Handle various possible response structures
            if (Array.isArray(response)) {
                // Direct array: [...]
                transactions = response;
            } else if (Array.isArray(response?.data)) {
                // Laravel resource style: { data: [...] }
                transactions = response.data;
            } else if (Array.isArray(response?.data?.transactions)) {
                // Nested: { data: { transactions: [...] } }
                transactions = response.data.transactions;
            } else if (Array.isArray(response?.transactions)) {
                // Direct key: { transactions: [...] }
                transactions = response.transactions;
            }

            if (Array.isArray(transactions)) {
                console.log("Extracted transactions:", transactions);
                setParsedData(transactions);
                enqueueSnackbar(`Parsed ${transactions.length} rows successfully`, { variant: 'success' });
            } else {
                console.error("Failed to extract array from response", response);
                setParsedData([]);
                enqueueSnackbar("Parsed data format unexpected", { variant: 'warning' });
            }
            setIsParsing(false);
        },
        onError: (error: any) => {
            setIsParsing(false);
            enqueueSnackbar(error.response?.data?.message || "Failed to parse file", { variant: 'error' });
        }
    });

    // Save Mutation
    const saveMutation = useMutation({
        mutationFn: (data: any[]) => statementService.saveTransactions(data, selectedAccountId),
        onSuccess: () => {
            enqueueSnackbar("All transactions saved successfully", { variant: 'success' });
            setParsedData([]);
            setFile(null);
            setSelectedFormatId("");
            // Keep selectedAccountId or reset? Usually helpful to keep.
        },
        onError: (error: any) => {
            enqueueSnackbar("Failed to save some transactions", { variant: 'error' });
            console.error(error);
        }
    });

    const handleCreateCategory = async (name: string, type: 'income' | 'expense') => {
        try {
            const result = await createCategoryMutation.mutateAsync({ name, type });
            // Return the new category object. 
            // IncomeSourceController returns { source: ... }
            // ExpenseCategoryController returns { category: ... }
            const data = (result as any)?.data || result;
            return type === 'income' ? (data?.source || data) : (data?.category || data);
        } catch (e) {
            return null; // mutation onError handles notification
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleParse = () => {
        if (!file || !selectedFormatId || !selectedAccountId) {
            enqueueSnackbar("Please select an account, file, and format", { variant: 'warning' });
            return;
        }

        const format = formats.find((f: any) => f.id.toString() === selectedFormatId);
        if (!format) {
            enqueueSnackbar("Selected format not found", { variant: 'error' });
            return;
        }

        setIsParsing(true);
        parseMutation.mutate({ file, format });
    };

    const handleSave = () => {
        // Validate
        const invalidRows = parsedData.filter(r => !r.category);
        if (invalidRows.length > 0) {
            enqueueSnackbar(`Please select a category for all ${invalidRows.length} rows.`, { variant: 'warning' });
            return;
        }
        saveMutation.mutate(parsedData);
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl text-green-800">Import Statement</h1>
                    <p className="text-sm text-green-600 mt-1">Upload Excel statement and map transactions</p>
                </div>
                {parsedData.length > 0 && (
                    <Button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                    >
                        {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Imported Rows
                    </Button>
                )}
            </div>

            {parsedData.length === 0 ? (
                <Card className="border-green-100 bg-white shadow-sm max-w-2xl mx-auto mt-10 w-full">
                    <CardHeader>
                        <CardTitle className="text-green-800 flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5" />
                            Select File & Format
                        </CardTitle>
                        <CardDescription>
                            Choose the defined statement format and the Excel file to upload.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-green-800">Account <span className="text-red-500">*</span></Label>
                            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                <SelectTrigger className="border-green-200 focus:ring-green-400">
                                    <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((acc: any) => (
                                        <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-green-800">Statement Format <span className="text-red-500">*</span></Label>
                            <Select value={selectedFormatId} onValueChange={setSelectedFormatId}>
                                <SelectTrigger className="border-green-200 focus:ring-green-400">
                                    <SelectValue placeholder="Select a format" />
                                </SelectTrigger>
                                <SelectContent>
                                    {formats.map((f: any) => (
                                        <SelectItem key={f.id} value={f.id.toString()}>{f.bankName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-green-800">Excel File (.xlsx) <span className="text-red-500">*</span></Label>
                            <div className="border-2 border-dashed border-green-200 rounded-lg p-8 text-center bg-green-50/30 hover:bg-green-50/50 transition-colors cursor-pointer relative">
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    <Upload className="w-8 h-8 text-green-600" />
                                    <span className="text-sm text-green-700 font-medium">
                                        {file ? file.name : "Click to upload or drag and drop"}
                                    </span>
                                    {!file && <span className="text-xs text-green-500">Only .xlsx files are supported</span>}
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleParse}
                            disabled={!file || !selectedFormatId || !selectedAccountId || isParsing}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                            {isParsing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Parsing...
                                </>
                            ) : (
                                <>
                                    <FileCheck className="w-4 h-4 mr-2" />
                                    Import & Preview
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex-1 min-h-0 mb-[50px]">
                    <EditableDataGrid
                        data={parsedData}
                        onDataChange={setParsedData}
                        incomeCategories={incomeSources}
                        expenseCategories={expenseCategories}
                        onCreateCategory={handleCreateCategory}
                    />
                </div>
            )}
        </div>
    );
}
