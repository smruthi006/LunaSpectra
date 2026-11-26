import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  caption: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
}

export function DataTable<T>({ caption, columns, rows, getRowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-lunar-border bg-lunar-surface">
      <table className="min-w-full divide-y divide-lunar-border text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-lunar-panel/80">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-lunar-muted ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-lunar-border/70">
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)} className="hover:bg-lunar-panel/40">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-lunar-text ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
