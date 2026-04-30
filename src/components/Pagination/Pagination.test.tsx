/**
 * Pagination — unit tests (features#491).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders the page indicator and total', () => {
    render(
      <Pagination page={0} pageSize={25} total={120} onPageChange={() => {}} />,
    );
    // 120 / 25 = 5 pages
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    expect(screen.getByText('120 total')).toBeInTheDocument();
  });

  it('disables Previous on the first page', () => {
    render(
      <Pagination page={0} pageSize={25} total={120} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled();
  });

  it('disables Next on the last page', () => {
    render(
      <Pagination page={4} pageSize={25} total={120} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).not.toBeDisabled();
  });

  it('disables both buttons when total is 0', () => {
    render(
      <Pagination page={0} pageSize={25} total={0} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByText('0 total')).toBeInTheDocument();
  });

  it('calls onPageChange with currentPage + 1 when Next is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={1} pageSize={25} total={120} onPageChange={onPageChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with currentPage - 1 when Previous is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={3} pageSize={25} total={120} onPageChange={onPageChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('does not render the page-size selector when onPageSizeChange is omitted', () => {
    render(
      <Pagination page={0} pageSize={25} total={120} onPageChange={() => {}} />,
    );
    expect(screen.queryByLabelText('Items per page')).toBeNull();
  });

  it('renders a page-size selector and calls onPageSizeChange when changed', () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        page={0}
        pageSize={25}
        total={120}
        onPageChange={() => {}}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    const select = screen.getByLabelText('Items per page') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '100' } });
    expect(onPageSizeChange).toHaveBeenCalledWith(100);
  });

  it('respects the ariaLabel prop on the navigation region', () => {
    render(
      <Pagination
        page={0}
        pageSize={25}
        total={120}
        onPageChange={() => {}}
        ariaLabel="Roles pagination"
      />,
    );
    expect(
      screen.getByRole('navigation', { name: 'Roles pagination' }),
    ).toBeInTheDocument();
  });

  it('uses the default ariaLabel when none is provided', () => {
    render(
      <Pagination page={0} pageSize={25} total={120} onPageChange={() => {}} />,
    );
    expect(
      screen.getByRole('navigation', { name: 'Pagination' }),
    ).toBeInTheDocument();
  });

  it('clamps an out-of-range page prop to the last valid page', () => {
    // 50 items, 25 per page = 2 pages. page=99 should clamp to page index 1.
    render(
      <Pagination page={99} pageSize={25} total={50} onPageChange={() => {}} />,
    );
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('renders custom pageSizeOptions when provided', () => {
    render(
      <Pagination
        page={0}
        pageSize={10}
        total={120}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        pageSizeOptions={[10, 20, 50]}
      />,
    );
    const select = screen.getByLabelText('Items per page') as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).toEqual(['10', '20', '50']);
  });
});
