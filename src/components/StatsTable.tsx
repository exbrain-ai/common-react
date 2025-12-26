/**
 * StatsTable component for displaying user statistics
 * Specialized component for the Hello project
 */

import React, { useMemo } from 'react';
import { Table, TableColumn } from './Table';

export interface UserStats {
  name: string;
  title?: string;
  count: number;
  lastHelloAt: string;
}

export interface StatsTableProps {
  data: UserStats[];
  className?: string;
}

export const StatsTable: React.FC<StatsTableProps> = ({ data, className = '' }) => {
  // Sort data by count (descending), then by name (ascending)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
  }, [data]);

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const columns: TableColumn<UserStats>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (value, row) => (
        <div>
          {row.title && (
            <span className="exbrain-text-muted" style={{ marginRight: '4px' }}>
              {row.title}
            </span>
          )}
          <span className="exbrain-text-primary">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'count',
      label: 'Count',
      render: (value) => (
        <div className="exbrain-text-center" style={{ fontWeight: '600', color: 'var(--exbrain-primary)' }}>
          {value}
        </div>
      ),
    },
    {
      key: 'lastHelloAt',
      label: 'Last Hello At',
      render: (value) => (
        <div className="exbrain-text-muted" style={{ fontSize: 'var(--exbrain-font-size-sm)' }}>
          {formatTimestamp(value)}
        </div>
      ),
    },
  ];

  return (
    <Table
      data={sortedData}
      columns={columns}
      emptyMessage="No statistics available yet. Submit a greeting to get started!"
      className={className}
    />
  );
};


