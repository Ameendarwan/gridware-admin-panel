import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TasksTableToolbarActions from './DataTableToolbarActions';
import { createMockTable as baseCreateMockTable } from '@tests/dataTableHelpers';

/**
 * Mock implementations follow patterns from tests/commonMocks.tsx
 * These must be inline due to vitest hoisting - imports are not available in vi.mock() calls
 */

// Mock dependencies with accessible references
const mockUseLocation = vi.fn().mockReturnValue({ pathname: '/poles' });
const mockSetSearchParams = vi.fn();
const mockUseSearchParams = vi.fn().mockReturnValue([new URLSearchParams(), mockSetSearchParams]);

vi.mock('react-router-dom', () => ({
  useLocation: () => mockUseLocation(),
  useSearchParams: () => mockUseSearchParams(),
  SetURLSearchParams: vi.fn(),
}));

vi.mock('@app/components/DropdownMenu/DropdownMenu', () => ({
  DropdownMenu: vi.fn(({ children }) => <div data-testid="dropdown-menu">{children}</div>),
  DropdownMenuContent: vi.fn(({ children, align, className }) => (
    <div data-testid="dropdown-menu-content" data-align={align} className={className}>
      {children}
    </div>
  )),
  DropdownMenuItem: vi.fn(({ children, onClick }) => (
    <button
      data-testid={`dropdown-menu-item-${typeof children === 'string' ? children.toLowerCase().replaceAll(/\s+/g, '-') : 'item'}`}
      onClick={onClick}>
      {children}
    </button>
  )),
  DropdownMenuTrigger: vi.fn(({ children, asChild }) => (
    <div data-testid="dropdown-menu-trigger" data-as-child={asChild}>
      {children}
    </div>
  )),
}));

vi.mock('@app/components/Button/Button', () => ({
  Button: vi.fn(({ children, className, variant, size }) => (
    <button data-testid="button" className={className} data-variant={variant} data-size={size}>
      {children}
    </button>
  )),
}));

vi.mock('@app/components/ConfirmationDialog', () => ({
  __esModule: true,
  default: vi.fn(({ children, title, description, open, _onOpenChange, onConfirm }) => (
    <button data-testid="confirmation-dialog" data-open={open} data-title={title} onClick={() => onConfirm?.()}>
      {description}
      {children}
    </button>
  )),
}));

// Create mock functions with references for testing
const mockDeleteHandler = vi.fn();
const mockExportTableToCSV = vi.fn();
const mockExportTableToExcel = vi.fn();
const mockPrintTable = vi.fn();

vi.mock('@app/components/DataTable/DataTable.utils', () => ({
  deleteHandler: (...args: any[]) => mockDeleteHandler(...args),
  exportTableToCSV: (...args: any[]) => mockExportTableToCSV(...args),
  exportTableToExcel: (...args: any[]) => mockExportTableToExcel(...args),
  printTable: (...args: any[]) => mockPrintTable(...args),
  createQueryString: vi.fn(() => 'mock-query-string'),
}));

vi.mock('@app/lib/api-config', () => ({
  API: {
    patch: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TasksTableToolbarActions component', () => {
  // Mock table type with minimal required properties to satisfy Table<any>
  type MockTableRow = { id: string; original: { id: number } };

  // Create mock table with selected rows support using the shared helper
  const createMockTableWithRows = (selectedRows: MockTableRow[] = []) => baseCreateMockTable({ selectedRows });

  // Helper function
  function renderToolbarActions(props = {}) {
    const defaultProps = {
      table: createMockTableWithRows(),
      url: '/api/test',
    };
    return render(<TasksTableToolbarActions {...defaultProps} {...props} />);
  }

  beforeEach(() => {
    // Reset mocks before each test
    mockUseLocation.mockReturnValue({ pathname: '/poles' });
    mockDeleteHandler.mockClear();
    mockExportTableToCSV.mockClear();
    mockExportTableToExcel.mockClear();
    mockPrintTable.mockClear();
  });

  it('renders export dropdown menu', () => {
    renderToolbarActions();

    // Check export button
    const buttons = screen.getAllByTestId('button');
    const exportButton = buttons.find(button => button.textContent?.includes('Export'));
    expect(exportButton).toBeDefined();
    expect(exportButton).toHaveTextContent('Export');

    // Check dropdown menu content
    const dropdownMenuContent = screen.getByTestId('dropdown-menu-content');
    expect(dropdownMenuContent).toBeInTheDocument();
  });

  it('does not render "With Selected" dropdown when no rows are selected', () => {
    renderToolbarActions();

    // Only one button (Export) should be rendered
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBe(1);
    expect(buttons[0]).toHaveTextContent('Export');

    // "With Selected" text should not be present
    const buttonTexts = buttons.map(button => button.textContent || '');
    expect(buttonTexts.some(text => text.includes('With Selected'))).toBe(false);
  });

  it('renders "With Selected" dropdown when rows are selected', () => {
    const selectedRows = [
      { id: '1', original: { id: 1 } },
      { id: '2', original: { id: 2 } },
    ];
    const mockTable = createMockTableWithRows(selectedRows);

    renderToolbarActions({ table: mockTable });

    // Two buttons should be rendered (With Selected and Export)
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBe(2);

    // Check "With Selected" button text includes count
    const withSelectedButton = buttons.find(button => button.textContent?.includes('With Selected'));
    expect(withSelectedButton).toBeDefined();
    expect(withSelectedButton).toHaveTextContent('With Selected (2)');
  });

  it('calls exportTableToCSV when CSV option is clicked', () => {
    const mockTable = createMockTableWithRows();
    renderToolbarActions({ table: mockTable });

    // Find all dropdown menu items
    const menuItems = screen.getAllByTestId(/^dropdown-menu-item/);

    // Find the CSV item by checking its text content
    const csvItem = menuItems.find(item => item.textContent?.includes('CSV'));
    expect(csvItem).toBeDefined();

    // Click on CSV option
    if (csvItem) fireEvent.click(csvItem);

    // Check that exportTableToCSV was called
    expect(mockExportTableToCSV).toHaveBeenCalled();
    // Check first argument is the table
    expect(mockExportTableToCSV.mock.calls[0][0]).toBe(mockTable);
    // Check second argument has the expected properties
    const options = mockExportTableToCSV.mock.calls[0][1];
    expect(options).toHaveProperty('filename');
    expect(options).toHaveProperty('excludeColumns');
    expect(options.excludeColumns).toContain('select');
    expect(options.excludeColumns).toContain('actions');
    expect(options.excludeColumns).toContain('shortcuts');
  });

  it('calls exportTableToExcel when Excel option is clicked', () => {
    const mockTable = createMockTableWithRows();
    renderToolbarActions({ table: mockTable });

    // Find all dropdown menu items
    const menuItems = screen.getAllByTestId(/^dropdown-menu-item/);

    // Find the Excel item by checking its text content
    const excelItem = menuItems.find(item => item.textContent?.includes('Excel'));
    expect(excelItem).toBeDefined();

    // Click on Excel option
    if (excelItem) fireEvent.click(excelItem);

    // Check that exportTableToExcel was called
    expect(mockExportTableToExcel).toHaveBeenCalled();
    // Check first argument is the table
    expect(mockExportTableToExcel.mock.calls[0][0]).toBe(mockTable);
    // Check second argument has the expected properties
    const options = mockExportTableToExcel.mock.calls[0][1];
    expect(options).toHaveProperty('filename');
    expect(options).toHaveProperty('excludeColumns');
  });

  it('calls printTable when Print option is clicked', () => {
    const mockTable = createMockTableWithRows();
    renderToolbarActions({ table: mockTable });

    // Find all dropdown menu items
    const menuItems = screen.getAllByTestId(/^dropdown-menu-item/);

    // Find the Print item by checking its text content
    const printItem = menuItems.find(item => item.textContent?.includes('Print'));
    expect(printItem).toBeDefined();

    // Click on Print option
    if (printItem) fireEvent.click(printItem);

    // Check that printTable was called
    expect(mockPrintTable).toHaveBeenCalled();
    // Check first argument is the table
    expect(mockPrintTable.mock.calls[0][0]).toBe(mockTable);
    // Check second argument has the expected properties
    const options = mockPrintTable.mock.calls[0][1];
    expect(options).toHaveProperty('title');
    expect(options).toHaveProperty('excludeColumns');
  });

  it('renders PolesWithSelectedOptions for pole paths', () => {
    // Mock that we're on the poles page
    mockUseLocation.mockReturnValue({ pathname: '/poles' });

    const selectedRows = [
      { id: '1', original: { id: 1 } },
      { id: '2', original: { id: 2 } },
    ];
    const mockTable = createMockTableWithRows(selectedRows);

    renderToolbarActions({ table: mockTable, url: '/api/poles' });

    // Check that the "With Selected" dropdown is rendered
    const buttons = screen.getAllByTestId('button');
    const withSelectedButton = buttons.find(button => button.textContent?.includes('With Selected'));
    expect(withSelectedButton).toBeDefined();

    // For poles, we should have specific options like "Mark as Non-existent"
    // Since PolesWithSelectedOptions is a separate component, we can check if it's rendered
    // by looking for its specific dropdown menu items
    const dropdownMenuContents = screen.getAllByTestId('dropdown-menu-content');
    expect(dropdownMenuContents.length).toBeGreaterThan(0);
    expect(dropdownMenuContents[0]).toBeInTheDocument();
  });

  it('renders Delete option for non-pole paths', () => {
    // Mock that we're on a non-pole page
    mockUseLocation.mockReturnValue({ pathname: '/users' });

    const selectedRows = [
      { id: '1', original: { id: 1 } },
      { id: '2', original: { id: 2 } },
    ];
    const mockTable = createMockTableWithRows(selectedRows);

    renderToolbarActions({ table: mockTable, url: '/api/users' });

    // Find all dropdown menu items
    const menuItems = screen.getAllByTestId(/^dropdown-menu-item/);

    // Find the Delete item by checking its text content
    const deleteItem = menuItems.find(item => item.textContent === 'Delete');
    expect(deleteItem).toBeDefined();

    // Click on Delete option
    if (deleteItem) {
      fireEvent.click(deleteItem);
    }

    // Check that resetRowSelection was called
    expect(mockTable.resetRowSelection).toHaveBeenCalled();

    // Check that deleteHandler was called
    expect(mockDeleteHandler).toHaveBeenCalled();

    // Check the arguments
    const args = mockDeleteHandler.mock.calls[0][0];
    expect(args.selectedRowIds).toEqual([1, 2]);
    expect(args.url).toBe('/api/users');
    expect(args.setSearchParams).toBe(mockSetSearchParams);
  });
});
