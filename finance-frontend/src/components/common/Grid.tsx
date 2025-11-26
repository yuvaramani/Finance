import { ReactNode } from "react";
import { cn } from "@components/ui/utils";

interface GridProps {
  children: ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
  columns?: 1 | 2 | 3 | 4;
  padding?: boolean;
}

/**
 * Reusable Grid component for consistent form layouts
 * Used in dialogs and forms across all modules
 */
export function Grid({ 
  children, 
  className, 
  gap = "md",
  columns,
  padding = true 
}: GridProps) {
  const gapClasses = {
    sm: "gap-2.5",
    md: "gap-5",
    lg: "gap-6",
  };

  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid",
        gapClasses[gap],
        columns ? columnClasses[columns] : "",
        padding && "py-6",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Grid item for form fields
 * Used for consistent spacing of form inputs
 */
interface GridItemProps {
  children: ReactNode;
  className?: string;
  gap?: "sm" | "md";
}

export function GridItem({ 
  children, 
  className,
  gap = "sm" 
}: GridItemProps) {
  const gapClasses = {
    sm: "gap-2.5",
    md: "gap-4",
  };

  return (
    <div className={cn("grid", gapClasses[gap], className)}>
      {children}
    </div>
  );
}

