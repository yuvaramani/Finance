"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@components/ui/input";
import { Calendar } from "@components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { cn } from "@components/ui/utils";

interface DatePickerProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  align?: "start" | "center" | "end";
  label?: string;
  required?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className,
  inputClassName,
  align = "start",
  label,
  required = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = value ? new Date(value) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date.toISOString().slice(0, 10));
      setOpen(false); // Close popover after selection
    } else {
      onChange(undefined);
    }
  };

  const datePicker = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            readOnly
            disabled={disabled}
            value={value ? format(selectedDate!, "dd MMM yyyy") : ""}
            placeholder={placeholder}
            className={cn(
              "pr-10 border-green-200 focus:border-green-400 focus:ring-green-400 h-11 cursor-pointer",
              !value && "text-green-400",
              inputClassName
            )}
          />
          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0 bg-white border-green-100", className)} align={align}>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  if (label) {
    return (
      <div className="grid gap-2.5">
        <label className="text-green-800 flex items-center gap-1.5">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {datePicker}
      </div>
    );
  }

  return datePicker;
}

