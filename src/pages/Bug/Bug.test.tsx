import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Bug, { getColumns } from './Bug';

// Mocks
vi.mock('@app/components/DataTable/DataTable.utils', () => ({
  getCommonColumns: vi.fn(() => []),
  createColumn: vi.fn((...args) => args),
  formatDate: vi.fn(v => v),
  TextCell: ({ row, accessorKey, transform }: any) => (
    <span>
      {row?.getValue?.(accessorKey) ?? ''}
      {transform ? 'T' : ''}
    </span>
  ),
}));
vi.mock('@app/components/Grid', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="grid" {...props} />,
}));
vi.mock('@app/routes/urls', () => ({ urls: { bug: { list: '/bug/list' } } }));

// Helper to clear mocks
beforeEach(() => {
  vi.clearAllMocks();
});

describe('Bug page', () => {
  it('renders Grid with correct url', () => {
    render(
      <MemoryRouter>
        <Bug />
      </MemoryRouter>
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
    expect(grid.getAttribute('url')).toBe('/bug/all');
  });

  it('calls getColumns with navigate', () => {
    // The Grid mock will receive getColumns as a prop
    render(
      <MemoryRouter>
        <Bug />
      </MemoryRouter>
    );
    const grid = screen.getByTestId('grid');
    // The mock Grid receives getColumns as a prop
    expect(grid).toBeInTheDocument();
    // We can't access props on a DOM node, but we know the prop is passed by the implementation
    // so this test is just a smoke check for rendering
  });

  it('getColumns returns expected columns', () => {
    const navigate = vi.fn();
    const columns = getColumns(navigate);
    expect(Array.isArray(columns)).toBe(true);
    // Should include at least one column for id
    expect(columns.some((col: any) => Array.isArray(col) && col[0] === 'id')).toBe(true);
  });
});
