import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { cn } from "@components/ui/utils";

export interface StyledSelectOption {
  label: string;
  value: string;
}

interface StyledSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: StyledSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  modal?: boolean;
}

export function StyledSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className,
  modal = false,
}: StyledSelectProps) {
  return (
    <Select
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled}
      modal={modal}
    >
      <SelectTrigger
        className={cn(
          "h-11 border-green-200 text-green-800 focus:ring-green-200 focus:border-green-400 bg-white",
          "data-[placeholder]:text-green-500/70",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white border-green-100">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-green-800 focus:bg-green-50 focus:text-green-900"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

