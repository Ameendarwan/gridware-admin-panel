import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTablePagination from './DataTablePagination';
import { createMockTableState, createMockTable } from '@app/utils/testHelpers';

// Mock Button component
vi.mock('@app/components/Button/Button', () => ({
  Button: vi.fn(({ children, onClick, disabled, 'aria-label': ariaLabel }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid={`button-${ariaLabel?.toLowerCase().replaceAll(/\s+/g, '-')}`}>
      {children}
    </button>
  )),
}));

describe('DataTablePagination component', () => {
  const mockTable = createMockTable({
    getState: vi.fn(() => createMockTableState({ pagination: { pageIndex: 1, pageSize: 10 } })),
  });

  it('renders pagination information correctly', () => {
    render(<DataTablePagination table={mockTable} totalRows={100} />);

    // Check selected rows text
    expect(screen.getByText('2 of 100 row(s) selected.')).toBeInTheDocument();

    // Check current page information
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('renders navigation buttons correctly', () => {
    render(<DataTablePagination table={mockTable} totalRows={100} />);

    // Check that all navigation buttons are present
    expect(screen.getByTestId('button-go-to-first-page')).toBeInTheDocument();
    expect(screen.getByTestId('button-go-to-previous-page')).toBeInTheDocument();
    expect(screen.getByTestId('button-go-to-next-page')).toBeInTheDocument();
    expect(screen.getByTestId('button-go-to-last-page')).toBeInTheDocument();
  });

  it('disables previous/first buttons when on first page', () => {
    const firstPageTable = createMockTable({
      getState: vi.fn(() => createMockTableState({ pagination: { pageIndex: 0, pageSize: 10 } })), // First page
      getCanPreviousPage: vi.fn(() => false),
    });

    render(<DataTablePagination table={firstPageTable} totalRows={100} />);

    // Check that previous and first page buttons are disabled
    expect(screen.getByTestId('button-go-to-first-page')).toBeDisabled();
    expect(screen.getByTestId('button-go-to-previous-page')).toBeDisabled();
    expect(screen.getByTestId('button-go-to-next-page')).not.toBeDisabled();
    expect(screen.getByTestId('button-go-to-last-page')).not.toBeDisabled();
  });

  it('disables next/last buttons when on last page', () => {
    const lastPageTable = createMockTable({
      getState: vi.fn(() => createMockTableState({ pagination: { pageIndex: 4, pageSize: 10 } })), // Last page (of 5)
      getCanNextPage: vi.fn(() => false),
    });

    render(<DataTablePagination table={lastPageTable} totalRows={100} />);

    // Check that next and last page buttons are disabled
    expect(screen.getByTestId('button-go-to-first-page')).not.toBeDisabled();
    expect(screen.getByTestId('button-go-to-previous-page')).not.toBeDisabled();
    expect(screen.getByTestId('button-go-to-next-page')).toBeDisabled();
    expect(screen.getByTestId('button-go-to-last-page')).toBeDisabled();
  });

  it('calls table.previousPage when previous button is clicked', () => {
    render(<DataTablePagination table={mockTable} totalRows={100} />);

    fireEvent.click(screen.getByTestId('button-go-to-previous-page'));

    expect(mockTable.previousPage).toHaveBeenCalledTimes(1);
  });

  it('calls table.nextPage when next button is clicked', () => {
    render(<DataTablePagination table={mockTable} totalRows={100} />);

    fireEvent.click(screen.getByTestId('button-go-to-next-page'));

    expect(mockTable.nextPage).toHaveBeenCalledTimes(1);
  });

  it('calls table.setPageIndex(0) when first page button is clicked', () => {
    render(<DataTablePagination table={mockTable} totalRows={100} />);

    fireEvent.click(screen.getByTestId('button-go-to-first-page'));

    expect(mockTable.setPageIndex).toHaveBeenCalledWith(0);
  });

  it('calls table.setPageIndex(lastPage) when last page button is clicked', () => {
    render(<DataTablePagination table={mockTable} totalRows={100} />);

    fireEvent.click(screen.getByTestId('button-go-to-last-page'));

    expect(mockTable.setPageIndex).toHaveBeenCalledWith(4); // Last page index (5-1)
  });
});
