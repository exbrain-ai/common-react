/**
 * Table component for displaying tabular data
 */

import React, { useState, useMemo } from 'react';
import { TableProps, TableColumn } from '../types/common';

export type { TableColumn };

export const Table = <T extends Record<string, any>>({
  data,
  columns,
  emptyMessage = 'No data available',
  loading = false,
  sortable = false,
  onSort,
  className = '',
}: TableProps<T>) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (!sortable) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection, sortable]);

  const renderCell = (column: TableColumn<T>, row: T) => {
    if (column.render) {
      return column.render(row[column.key as keyof T], row);
    }
    return row[column.key as keyof T];
  };

  if (loading) {
    return (
      <div className={`medbai-table-container ${className}`}>
        <div className="medbai-table-empty">
          <div className="medbai-spinner" />
          <span style={{ marginLeft: '8px' }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className={`medbai-table-container ${className}`}>
        <div className="medbai-table-empty">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={`medbai-table-container ${className}`}>
      <table className="medbai-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`medbai-table-header ${
                  column.sortable ? 'medbai-table-header--sortable' : ''
                } ${column.className || ''}`}
                onClick={() => column.sortable && handleSort(String(column.key))}
              >
                {column.label}
                {sortKey === column.key && (
                  <span style={{ marginLeft: '4px' }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} className="medbai-table-row">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`medbai-table-cell ${column.className || ''}`}
                >
                  {renderCell(column, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
