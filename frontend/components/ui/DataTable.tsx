import React from "react";

export interface Column<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 shadow-sm">
      <table className="w-full text-left text-sm text-surface-600 dark:text-surface-400">
        <thead className="bg-surface-100 dark:bg-surface-800 text-xs uppercase text-surface-700 dark:text-surface-300 border-b border-surface-200 dark:border-surface-700">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-4 font-medium tracking-wider ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-4 h-4 rounded-none bg-primary-500 animate-pulse" />
                  <div className="w-4 h-4 rounded-none bg-primary-500 animate-pulse delay-75" />
                  <div className="w-4 h-4 rounded-none bg-primary-500 animate-pulse delay-150" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-surface-500">
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={` dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors ${onRowClick ? "cursor-pointer" : ""
                  }`}
              >
                {columns.map((col, index) => (
                  <td key={index} className={`px-6 py-4 whitespace-nowrap ${col.className || ""}`}>
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                        ? String(row[col.accessorKey])
                        : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
