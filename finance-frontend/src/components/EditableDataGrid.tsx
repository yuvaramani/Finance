
import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { cn } from "@components/ui/utils";
import {
    Check,
    ChevronsUpDown,
    Plus
} from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverAnchor,
} from "@components/ui/popover";
import { Button } from "@components/ui/button";

interface EditableDataGridProps {
    data: any[];
    onDataChange: (newData: any[]) => void;
    incomeCategories: any[];
    expenseCategories: any[];
    onCreateCategory: (name: string, type: 'income' | 'expense') => Promise<any>;
}

export function EditableDataGrid({
    data,
    onDataChange,
    incomeCategories,
    expenseCategories,
    onCreateCategory,
}: EditableDataGridProps) {
    const [rows, setRows] = useState(data);

    useEffect(() => {
        setRows(data);
    }, [data]);

    const handleNoteChange = (id: number, value: string) => {
        const updated = rows.map((row) =>
            row.id === id ? { ...row, notes: value } : row
        );
        setRows(updated);
        onDataChange(updated);
    };

    const handleCategorySelect = (id: number, category: any) => {
        const updated = rows.map((row) =>
            row.id === id ? { ...row, category: category } : row
        );
        setRows(updated);
        onDataChange(updated);
    };

    return (
        <div className="border border-green-100 rounded-md h-full overflow-auto bg-white shadow-sm">
            <Table>
                <TableHeader className="bg-green-50/50 sticky top-0 z-10 shadow-sm">
                    <TableRow>
                        <TableHead className="w-[120px] text-green-800 bg-green-50/90 backdrop-blur-sm">Date</TableHead>
                        <TableHead className="text-green-800 bg-green-50/90 backdrop-blur-sm">Use Description</TableHead>
                        <TableHead className="w-[120px] text-right text-green-800 bg-green-50/90 backdrop-blur-sm">Debit</TableHead>
                        <TableHead className="w-[120px] text-right text-green-800 bg-green-50/90 backdrop-blur-sm">Credit</TableHead>
                        <TableHead className="w-[250px] text-green-800 bg-green-50/90 backdrop-blur-sm">Category <span className="text-red-500">*</span></TableHead>
                        <TableHead className="w-[200px] text-green-800 bg-green-50/90 backdrop-blur-sm">Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => {
                        // Determine if it's income or expense based on type OR credit column presence
                        // Handle potential string numbers with commas
                        const creditVal = row.credit ? parseFloat(String(row.credit).replace(/,/g, '')) : 0;
                        const isIncome = row.type === 'income' || creditVal > 0;
                        const relevantCategories = isIncome ? incomeCategories : expenseCategories;

                        return (
                            <TableRow key={row.id} className="hover:bg-green-50/20">
                                <TableCell className="font-medium text-gray-700">
                                    {row.date}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {row.description}
                                </TableCell>
                                <TableCell className="text-right text-red-600 font-medium">
                                    {row.debit || row.amount && row.type === 'expense' ? `₹${row.debit || row.amount}` : '-'}
                                </TableCell>
                                <TableCell className="text-right text-green-600 font-medium">
                                    {row.credit || row.amount && row.type === 'income' ? `₹${row.credit || row.amount}` : '-'}
                                </TableCell>
                                <TableCell>
                                    <CategorySelect
                                        row={row}
                                        categories={relevantCategories}
                                        onSelect={(cat: any) => handleCategorySelect(row.id, cat)}
                                        onCreate={onCreateCategory}
                                        type={isIncome ? 'income' : 'expense'}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={row.notes || ""}
                                        onChange={(e) => handleNoteChange(row.id, e.target.value)}
                                        className="h-8 border-green-200 focus:border-green-400"
                                        placeholder="Add details..."
                                    />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    {rows.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                                No data to display. Please upload a file.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function CategorySelect({ row, categories, onSelect, onCreate, type }: any) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(row.category?.name || "");
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    // Sync search value when category changes externally
    useEffect(() => {
        setSearchValue(row.category?.name || "");
    }, [row.category]);

    const filtered = categories.filter((c: any) =>
        c.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const showCreate = searchValue && !filtered.some((c: any) => c.name.toLowerCase() === searchValue.toLowerCase());

    // Flattened options for keyboard navigation
    const options = [...filtered];
    if (showCreate) {
        options.push({ id: 'create-new', name: searchValue, isCreate: true });
    }

    const handleSelect = (category: any) => {
        if (category.isCreate) {
            handleCreate(category.name);
        } else {
            onSelect(category);
            setOpen(false);
        }
    };

    const handleCreate = async (name: string) => {
        const newCat = await onCreate(name, type);
        if (newCat) {
            onSelect(newCat);
            setOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) {
            if (e.key === "ArrowDown" || e.key === "Enter") {
                setOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                if (options[highlightedIndex]) {
                    handleSelect(options[highlightedIndex]);
                }
                break;
            case "Escape":
                setOpen(false);
                break;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor>
                <div className="relative">
                    <Input
                        value={searchValue}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            setOpen(true);
                            setHighlightedIndex(0);
                        }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Select category..."
                        className="h-8 border-green-200 focus:border-green-400 w-full"
                    />
                </div>
            </PopoverAnchor>
            <PopoverContent
                className="p-0 bg-white w-[200px]"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="max-h-[180px] overflow-y-auto py-1">
                    {options.length === 0 && (
                        <div className="py-2 px-3 text-sm text-gray-500">No categories found.</div>
                    )}
                    {options.map((option: any, index: number) => (
                        <div
                            key={option.id}
                            className={cn(
                                "flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-green-50/50",
                                highlightedIndex === index && "bg-green-50 text-green-900"
                            )}
                            onClick={() => handleSelect(option)}
                        >
                            {option.isCreate ? (
                                <div className="flex items-center w-full break-all">
                                    <span className="font-medium">{option.name}</span>
                                    <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                                        (New Label)
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 shrink-0",
                                            row.category?.id === option.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="truncate">{option.name}</span>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
