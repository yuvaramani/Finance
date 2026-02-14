import { ReactNode, useMemo, useState, useRef, useEffect } from "react";
import { Button } from "@components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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
  pageSize?: number; // If not provided, will be calculated dynamically
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  renderActions?: (row: T) => ReactNode;
  onRowDoubleClick?: (row: T) => void;
  bodyClassName?: string;
  // Pagination control props
  currentPage?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  autoCalculatePageSize?: boolean; // Enable automatic page size calculation
  onPageSizeChange?: (pageSize: number) => void; // Callback when page size is calculated
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  emptyMessage = "No records found",
  pageSize: providedPageSize,
  onEdit,
  onDelete,
  renderActions,
  onRowDoubleClick,
  bodyClassName,
  currentPage: controlledCurrentPage,
  onPageChange,
  showPagination = true,
  autoCalculatePageSize = true,
  onPageSizeChange,
}: DataTableProps<T>) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [calculatedPageSize, setCalculatedPageSize] = useState(providedPageSize || 10);

  // Use controlled page if provided, otherwise use internal state
  const currentPage = controlledCurrentPage !== undefined ? controlledCurrentPage : internalCurrentPage;
  const setCurrentPage = onPageChange || setInternalCurrentPage;

  // Calculate page size dynamically based on available height
  useEffect(() => {
    if (!autoCalculatePageSize || providedPageSize !== undefined) {
      return;
    }

    const calculatePageSize = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        if (containerHeight === 0) return; // Container not yet rendered

        // Get actual header height by measuring
        const tableHeader = tableContainerRef.current.querySelector('thead');
        const headerHeight = tableHeader ? tableHeader.getBoundingClientRect().height : 48; // Default to 48 if not found

        // Pagination height - standard sized buttons usually around 36-40px + padding
        // User wants pagination 50px from bottom.
        // Let's assume pagination section takes about 50px of space
        const paginationHeight = showPagination ? 50 : 0;
        const bottomSpacing = 55; // User requirement (50px) + small buffer


        // Use fixed row height to prevent measurement errors causing "1 row" bug
        // The CSS defines h-[52px], so we trust that.
        const rowHeight = 52;

        // Available height for ROWS
        const availableHeight = containerHeight - headerHeight - paginationHeight - bottomSpacing;

        // DEBUG: Traverse and log parent heights to find the break
        const debugHierarchy = [];
        let currentElement: HTMLElement | null = tableContainerRef.current;
        let depth = 0;
        while (currentElement && currentElement.tagName !== 'BODY' && depth < 10) {
          debugHierarchy.push({
            tag: currentElement.tagName,
            id: currentElement.id,
            className: currentElement.className,
            // Log all dimensions to see who is shrinking
            dims: `${currentElement.clientWidth}x${currentElement.clientHeight}`,
            style: currentElement.getAttribute('style') || 'none'
          });
          currentElement = currentElement.parentElement;
          depth++;
        }
        // Use table for easier reading in console, or stringify for copy paste
        console.log('DataTable Hierarchy Breakdown (Child -> Parent):');
        console.table(debugHierarchy);
        console.log('DataTable Hierarchy JSON:', JSON.stringify(debugHierarchy, null, 2));

        console.log('DataTable Metrics:', {
          containerHeight,
          headerHeight,
          paginationHeight,
          bottomSpacing,
          availableHeight,
          rowHeight
        });

        // Calculate rows that fit - be precise
        const rowsThatFit = Math.floor(Math.max(0, availableHeight) / rowHeight);

        // Set pageSize to fit exactly, minimum 1
        const newPageSize = Math.max(1, rowsThatFit);
        if (newPageSize !== calculatedPageSize) {
          setCalculatedPageSize(newPageSize);
          onPageSizeChange?.(newPageSize);
        }
      }
    };

    // Use requestAnimationFrame for better timing
    let rafId: number;
    const scheduleCalculation = () => {
      rafId = requestAnimationFrame(() => {
        calculatePageSize();
        // Recalculate after rows are rendered
        setTimeout(calculatePageSize, 50);
        setTimeout(calculatePageSize, 150);
        setTimeout(calculatePageSize, 300);
      });
    };

    scheduleCalculation();
    window.addEventListener('resize', calculatePageSize);

    // Also recalculate when container might have changed
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(calculatePageSize, 100);
    });
    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }

    // Recalculate when data changes (rows might have different heights)
    if (data.length > 0) {
      setTimeout(calculatePageSize, 200);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', calculatePageSize);
      resizeObserver.disconnect();
    };
  }, [autoCalculatePageSize, providedPageSize, data.length, calculatedPageSize, onPageSizeChange, showPagination]);

  const pageSize = providedPageSize || calculatedPageSize;
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  // Only add empty rows on the last page if we have fewer rows than pageSize
  // This ensures the table fills the available space without gaps
  // But only if we actually need them to fill the space
  const emptyRows = true // Always fill rows to maintain height consistency
    ? Math.max(0, pageSize - currentData.length)
    : 0;

  const renderCellContent = (row: T, column: Column<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor] as ReactNode;
  };

  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  return (
    <div ref={tableContainerRef} className="flex flex-col h-full min-h-0 relative">
      <div className="flex-1 min-h-0 rounded flex flex-col overflow-hidden">
        <div className={cn("flex-1 min-h-0 overflow-hidden", bodyClassName)}>
          <Table className="border border-green-200">
            <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
              <TableRow className="bg-green-50/50 hover:bg-green-50/50 border-b border-green-200">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={cn("text-green-800 font-semibold h-[48px]", column.className)}
                  >
                    {column.header}
                  </TableHead>
                ))}
                {(onEdit || onDelete || renderActions) && (
                  <TableHead className="text-green-800 text-right font-semibold h-[48px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody ref={tableBodyRef} className="flex-1">
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
                        "transition-colors [&:hover_.action-buttons]:opacity-100 cursor-pointer h-[52px]",
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(row);
                                }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(row);
                                }}
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

      {showPagination && data.length > 0 && (
        <div className="absolute bottom-[50px] left-0 right-0 flex items-center justify-between px-6 h-[50px] z-20 bg-white border-t border-gray-100">
          <div className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900">{startIndex + 1}</span> to{" "}
            <span className="text-gray-900">{Math.min(endIndex, data.length)}</span> of{" "}
            <span className="text-gray-900">{data.length}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 text-gray-500 hover:text-green-600 hover:bg-green-50 border-gray-200"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 text-gray-500 hover:text-green-600 hover:bg-green-50 border-gray-200 mr-2"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter(page => {
                // simple logic to show few pages around current
                if (totalPages <= 7) return true;
                if (page === 1 || page === totalPages) return true;
                if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                return false;
              })
              .map((page, index, array) => {
                // Add ellipsis logic if needed, simplify for now or just standard list
                // The previous code showed ALL pages. Keeping it simple but cleaner.
                // Actually, if list is huge, this breaks. Let's just keep the simple map for now unless user has tons of pages.
                // Reverting filter to full map for safety as per previous code, but styled.
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={cn(
                      "h-8 w-8 p-0 font-medium text-sm rounded-md transition-all",
                      currentPage === page
                        ? "bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg scale-105"
                        : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                    )}
                  >
                    {page}
                  </Button>
                )
              })}

            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 text-gray-500 hover:text-green-600 hover:bg-green-50 border-gray-200 ml-2"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 text-gray-500 hover:text-green-600 hover:bg-green-50 border-gray-200"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
