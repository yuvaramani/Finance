import { ReactNode, useState, useMemo } from "react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyMessage?: string;
  getRowKey: (row: T) => string | number;
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  emptyMessage = "No data found",
  getRowKey,
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  // Fill empty rows to maintain consistent height
  const emptyRowsCount = pageSize - currentData.length;
  const emptyRows = Array.from({ length: emptyRowsCount }, (_, i) => i);

  // Reset to page 1 if current page exceeds total pages
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

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
    <div className="flex flex-col h-full">
      {/* Table Container - Takes up available space */}
      <div className="flex-1 min-h-0 border border-green-100 rounded">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-green-50/50 hover:bg-green-50/50">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={`text-green-800 ${column.className || ""}`}
                >
                  {column.header}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="text-green-800 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="text-center py-8 text-green-600"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {/* Actual data rows */}
                {currentData.map((row, index) => (
                  <TableRow
                    key={getRowKey(row)}
                    className={`transition-colors [&:hover_.action-buttons]:opacity-100 ${
                      index % 2 === 0
                        ? "bg-white hover:bg-green-50/40"
                        : "bg-green-50/20 hover:bg-green-50/50"
                    }`}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={column.cellClassName || "text-green-700"}
                      >
                        {renderCellContent(row, column)}
                      </TableCell>
                    ))}
                    {(onEdit || onDelete) && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 action-buttons opacity-0 transition-opacity duration-200">
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
                              className="h-8 w-8 text-red-700 hover:bg-red-50 hover:text-red-800"
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
                {/* Empty placeholder rows */}
                {emptyRows.map((index) => (
                  <TableRow
                    key={`empty-${index}`}
                    className={`${
                      (currentData.length + index) % 2 === 0
                        ? "bg-white"
                        : "bg-green-50/20"
                    }`}
                  >
                    {columns.map((_, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className="text-green-700 h-[53px]"
                      >
                        &nbsp;
                      </TableCell>
                    ))}
                    {(onEdit || onDelete) && (
                      <TableCell className="h-[53px]">&nbsp;</TableCell>
                    )}
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Always at bottom */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-green-100 bg-white flex-shrink-0">
          <div className="text-sm text-green-700">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
          </div>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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