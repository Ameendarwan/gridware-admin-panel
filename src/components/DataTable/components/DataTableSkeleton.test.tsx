import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataTableSkeleton from './DataTableSkeleton';

// Mock dependencies
vi.mock('@app/components/Table/Table', () => ({
  Table: vi.fn(({ children }) => (
    <div data-testid="table">
      <table>{children}</table>
    </div>
  )),
  TableBody: vi.fn(({ children }) => <tbody data-testid="table-body">{children}</tbody>),
  TableCell: vi.fn(({ children, style }) => (
    <td data-testid="table-cell" style={style}>
      {children}
    </td>
  )),
  TableHead: vi.fn(({ children, style }) => (
    <th data-testid="table-head" style={style}>
      {children}
    </th>
  )),
  TableHeader: vi.fn(({ children }) => <thead data-testid="table-header">{children}</thead>),
  TableRow: vi.fn(({ children, className }) => (
    <tr data-testid="table-row" className={className}>
      {children}
    </tr>
  )),
}));

vi.mock('@app/components/Skeleton/Skeleton', () => ({
  Skeleton: vi.fn(({ className }) => <div data-testid="skeleton" className={className}></div>),
}));

describe('DataTableSkeleton component', () => {
  it('renders with default props', () => {
    render(<DataTableSkeleton columnCount={4} />);

    // Check table structure
    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
    expect(screen.getByTestId('table-body')).toBeInTheDocument();

    // Check header row
    const headerCells = screen.getAllByTestId('table-head');
    expect(headerCells.length).toBe(4); // columnCount = 4

    // Check body rows (default rowCount = 10)
    const bodyRows = screen
      .getAllByTestId('table-row')
      .filter(row => row.parentElement?.dataset.testid === 'table-body');
    expect(bodyRows.length).toBe(10);

    // Check view options skeleton
    const viewOptionsSkeleton = screen
      .getAllByTestId('skeleton')
      .find(skeleton => skeleton.className.includes('ml-auto') && skeleton.className.includes('lg:flex'));
    expect(viewOptionsSkeleton).toBeInTheDocument();

    // Check pagination skeleton - look for the h-7 w-40 shrink-0 skeleton which is part of pagination
    const paginationSkeletons = screen
      .getAllByTestId('skeleton')
      .filter(
        skeleton =>
          skeleton.className.includes('h-7') &&
          skeleton.className.includes('w-40') &&
          skeleton.className.includes('shrink-0')
      );
    expect(paginationSkeletons.length).toBeGreaterThan(0);
  });

  it('renders with custom rowCount', () => {
    render(<DataTableSkeleton columnCount={3} rowCount={5} />);

    const bodyRows = screen
      .getAllByTestId('table-row')
      .filter(row => row.parentElement?.dataset.testid === 'table-body');
    expect(bodyRows.length).toBe(5);
  });

  it('renders with searchable columns', () => {
    render(<DataTableSkeleton columnCount={3} searchableColumnCount={2} />);

    const searchSkeletons = screen
      .getAllByTestId('skeleton')
      .filter(
        skeleton =>
          skeleton.className.includes('h-7') &&
          (skeleton.className.includes('w-40') || skeleton.className.includes('lg:w-60'))
      );
    expect(searchSkeletons.length).toBe(3); // The component creates 3 skeletons for 3 columns
  });

  it('renders with filterable columns', () => {
    render(<DataTableSkeleton columnCount={3} filterableColumnCount={3} />);

    const filterSkeletons = screen
      .getAllByTestId('skeleton')
      .filter(
        skeleton =>
          skeleton.className.includes('h-7') &&
          skeleton.className.includes('w-[4.5rem]') &&
          skeleton.className.includes('border-dashed')
      );
    expect(filterSkeletons.length).toBe(3);
  });

  it('does not render view options when showViewOptions is false', () => {
    render(<DataTableSkeleton columnCount={3} showViewOptions={false} />);

    const viewOptionsSkeleton = screen
      .queryAllByTestId('skeleton')
      .find(skeleton => skeleton.className.includes('ml-auto') && skeleton.className.includes('lg:flex'));
    expect(viewOptionsSkeleton).toBeUndefined();
  });

  it('does not render pagination when withPagination is false', () => {
    render(<DataTableSkeleton columnCount={3} withPagination={false} />);

    const paginationSkeleton = screen
      .queryAllByTestId('skeleton')
      .find(skeleton => skeleton.parentElement?.className.includes('flex-col-reverse'));
    expect(paginationSkeleton).toBeUndefined();
  });

  it('applies custom cell widths', () => {
    render(<DataTableSkeleton columnCount={3} cellWidths={['100px', '200px', '300px']} />);

    const tableCells = screen.getAllByTestId('table-cell');

    // Check if the cell widths are applied to both header and body cells
    const cellWidths = new Set();
    for (const cell of tableCells) {
      if (cell.style.width) {
        cellWidths.add(cell.style.width);
      }
    }

    expect(cellWidths.has('100px')).toBe(true);
    expect(cellWidths.has('200px')).toBe(true);
    expect(cellWidths.has('300px')).toBe(true);
  });

  it('applies shrinkZero property to cells', () => {
    render(<DataTableSkeleton columnCount={3} shrinkZero={true} />);

    const tableCells = screen.getAllByTestId('table-cell');

    // Check if the minWidth property is set to match the width when shrinkZero is true
    const hasMinWidth = tableCells.some(cell => cell.style.minWidth && cell.style.minWidth === cell.style.width);

    expect(hasMinWidth).toBe(true);
  });

  it('applies custom className', () => {
    render(<DataTableSkeleton columnCount={3} className="custom-class" />);

    // The custom className is applied to the outer div, which is the parent of the table
    // We need to modify our test to properly check for this
    render(<DataTableSkeleton columnCount={3} className="custom-class" data-testid="skeleton-container" />);

    // Check that the custom class is applied to the container div
    const container = screen.getByTestId('skeleton-container');
    expect(container).toHaveClass('custom-class');
  });
});
