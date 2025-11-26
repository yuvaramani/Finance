import { ReactNode, useMemo, useState } from "react";
import { Button } from "@components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@components/ui/utils";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string | number;
  emptyMessage?: string;
  pageSize?: number;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  renderActions?: (row: T) => ReactNode;
  onRowDoubleClick?: (row: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  emptyMessage = "No records found",
  pageSize = 10,
  onEdit,
  onDelete,
  renderActions,
  onRowDoubleClick,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const emptyRows = Math.max(0, pageSize - currentData.length);

  const renderCellContent = (row: T, column: Column<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor] as ReactNode;
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 border border-green-100 rounded flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
            <TableRow className="bg-green-50/50 hover:bg-green-50/50">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn("text-green-800", column.className)}
                >
                  {column.header}
                </TableHead>
              ))}
              {(onEdit || onDelete || renderActions) && (
                <TableHead className="text-green-800 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
            <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + ((onEdit || onDelete || renderActions) ? 1 : 0)}
                  className="text-center py-8 text-green-600"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {currentData.map((row, rowIndex) => (
                  <TableRow
                    key={getRowKey(row)}
                    className={cn(
                      "transition-colors [&:hover_.action-buttons]:opacity-100 cursor-pointer",
                      rowIndex % 2 === 0
                        ? "bg-white hover:bg-green-50/40"
                        : "bg-green-50/20 hover:bg-green-50/50"
                    )}
                    onDoubleClick={onRowDoubleClick ? () => onRowDoubleClick(row) : undefined}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={column.cellClassName || "text-green-700"}
                      >
                        {renderCellContent(row, column)}
                      </TableCell>
                    ))}
                    {(onEdit || onDelete || renderActions) && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 action-buttons opacity-0 transition-opacity duration-200">
                          {renderActions?.(row)}
                          {onEdit && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-700 hover:bg-green-50 hover:text-green-800"
                              onClick={() => onEdit(row)}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => onDelete(row)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}

                {Array.from({ length: emptyRows }).map((_, index) => (
                  <TableRow
                    key={`empty-${index}`}
                    className={(currentData.length + index) % 2 === 0 ? "bg-white" : "bg-green-50/20"}
                  >
                    {columns.map((_, colIdx) => (
                      <TableCell key={colIdx} className="h-[52px]">
                        &nbsp;
                      </TableCell>
                    ))}
                    {(onEdit || onDelete || renderActions) && (
                      <TableCell className="h-[52px]">&nbsp;</TableCell>
                    )}
                  </TableRow>
                ))}
              </>
            )}
            </TableBody>
          </Table>
        </div>
      </div>

      {data.length > 0 && (
        <div className="flex items-center justify-end px-4 py-3 border border-t-0 border-green-100 bg-white flex-shrink-0 rounded-b">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                  className={
                    currentPage === page
                      ? "bg-green-600 text-white hover:bg-green-700 min-w-[36px]"
                      : "border-green-200 text-green-700 hover:bg-green-50 min-w-[36px]"
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

