
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

const schema = yup.object({
    name: yup.string().required("Name is required"),
});

interface ExpenseCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    initialData?: any;
}

export function ExpenseCategoryDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading,
    initialData,
}: ExpenseCategoryDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                name: initialData?.name || "",
            });
        }
    }, [open, initialData, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white border-red-200 shadow-xl rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-red-800">{initialData ? "Edit Expense Category" : "Add Expense Category"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-red-900">Category Name</Label>
                        <Input id="name" {...register("name")} placeholder="e.g., Food, Travel" className="border-red-200 focus:border-red-400 focus:ring-red-400" />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-red-200 text-red-700 hover:bg-red-50">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                            {isLoading ? "Saving..." : initialData ? "Update Category" : "Save Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
