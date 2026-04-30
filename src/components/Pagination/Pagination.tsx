/**
 * Pagination — generic paginator for list views (features#491).
 *
 * Pairs with iam endpoints that accept `limit` + `offset` and return
 * an `X-Total-Count` header (iam#137):
 *   - GET /iam/v1/roles
 *   - GET /iam/v1/invitations
 *   - GET /iam/v1/invitations/pending
 *   - GET /iam/v1/tenants/{tenant_id}/members
 *
 * Page numbers are 0-indexed internally (offset = page * pageSize) and
 * displayed as 1-indexed ("Page 1 of N").
 *
 * Styling follows the existing common-react BEM convention
 * (`exbrain-pagination__*`) so apps can theme it from their stylesheets,
 * matching Button / Table / Input.
 */

import React from 'react';

export interface PaginationProps {
  /** 0-indexed current page. */
  page: number;
  /** Number of items per page. */
  pageSize: number;
  /** Total number of items across all pages. */
  total: number;
  /** Called with the new 0-indexed page when the user navigates. */
  onPageChange: (page: number) => void;
  /** Called when the user picks a new page size. If omitted, the size selector is hidden. */
  onPageSizeChange?: (size: number) => void;
  /** Choices shown in the page-size dropdown. Default [25, 50, 100, 200]. */
  pageSizeOptions?: number[];
  /** Accessible label for the navigation region. Default "Pagination". */
  ariaLabel?: string;
  /** Optional extra className appended to the root element. */
  className?: string;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  ariaLabel = 'Pagination',
  className = '',
}) => {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  // Clamp current page to a valid range so callers can't render "Page 5 of 2".
  const currentPage = Math.min(Math.max(0, page), totalPages - 1);

  const isFirst = currentPage <= 0;
  const isLast = currentPage >= totalPages - 1 || total === 0;

  const handlePrev = () => {
    if (!isFirst) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (!isLast) onPageChange(currentPage + 1);
  };
  const handleSizeChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const next = Number.parseInt(e.target.value, 10);
    if (Number.isFinite(next) && next > 0 && onPageSizeChange) {
      onPageSizeChange(next);
    }
  };

  const rootClasses = ['exbrain-pagination', className].filter(Boolean).join(' ');

  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      className={rootClasses}
    >
      <div className="exbrain-pagination__status" aria-live="polite">
        <span className="exbrain-pagination__page-indicator">
          Page {currentPage + 1} of {totalPages}
        </span>
        <span className="exbrain-pagination__total">{total} total</span>
      </div>

      <div className="exbrain-pagination__controls">
        {onPageSizeChange && (
          <label className="exbrain-pagination__size-label">
            <span className="exbrain-pagination__size-text">Per page</span>
            <select
              className="exbrain-pagination__size-select"
              value={safePageSize}
              onChange={handleSizeChange}
              aria-label="Items per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          className="exbrain-pagination__prev"
          onClick={handlePrev}
          disabled={isFirst}
          aria-label="Previous page"
        >
          Previous
        </button>
        <button
          type="button"
          className="exbrain-pagination__next"
          onClick={handleNext}
          disabled={isLast}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
};
