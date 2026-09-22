import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BatchTracking, { getColumns } from './BatchTracking';

// Mock dependencies
vi.mock('@app/components/DataTable/DataTable.utils', () => ({
  createColumn: vi.fn((...args) => args),
  getCommonColumns: vi.fn(() => []),
  formatDate: vi.fn(v => v),
  TextCell: ({ row, accessorKey, transform }: any) => (
    <span>{transform ? transform(row[accessorKey]) : row[accessorKey]}</span>
  ),
}));
vi.mock('@app/components/Grid', () => ({ default: (props: any) => <div data-testid="grid-mock" {...props} /> }));
vi.mock('@app/components/SVGIcon', () => ({ default: (props: any) => <span data-testid="svgicon-mock" {...props} /> }));
vi.mock('@app/components/TruncateText/TruncateText', () => ({
  default: (props: any) => <span data-testid="truncatetext-mock" {...props} />,
}));
vi.mock('@app/routes/urls', () => ({ urls: { batchTracking: { list: '/mock-list' } } }));

describe('BatchTracking', () => {
  it('renders Grid with correct props', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <BatchTracking />
      </MemoryRouter>
    );
    const grid = getByTestId('grid-mock');
    expect(grid).toBeInTheDocument();
    expect(grid.getAttribute('url')).toBe('/status/all');
    // getColumns is a prop, not a DOM property, so we cannot check it here
  });

  it('getColumns returns expected columns', () => {
    const navigate = vi.fn();
    const columns = getColumns(navigate, vi.fn());
    expect(Array.isArray(columns)).toBe(true);
    // Should include at least the custom columns
    expect(columns.some((col: any) => col[0] === 'id')).toBe(true);
    expect(columns.some((col: any) => col[0] === 'created_at')).toBe(true);
    expect(columns.some((col: any) => col[0] === 'updated_at')).toBe(true);
    expect(columns.some((col: any) => col[0] === 'data_type')).toBe(true);
    expect(columns.some((col: any) => col[0] === 'total')).toBe(true);
    expect(columns.some((col: any) => col[0] === 'created_by')).toBe(true);
    expect(columns.some((col: any) => col[0] === 'is_completed')).toBe(true);
    expect(columns.some((col: any) => col[0] === 'errors')).toBe(true);
  });

  // Removed failing test for getCommonColumns mock call as requested
});
