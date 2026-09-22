import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption 
} from './Table';

// Mock cn utility
vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Table components', () => {
  describe('Table', () => {
    it('renders with default props', () => {
      render(
        <Table data-testid="table-test">
          <tbody>
            <tr>
              <td>Cell content</td>
            </tr>
          </tbody>
        </Table>
      );
      
      const table = screen.getByTestId('table-test');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('w-full');
      expect(table).toHaveClass('caption-bottom');
      expect(table).toHaveClass('text-sm');
      expect(table.parentElement).toHaveClass('relative');
      expect(table.parentElement).toHaveClass('w-full');
      expect(table.parentElement).toHaveClass('overflow-auto');
    });

    it('applies custom className', () => {
      render(
        <Table className="custom-table" data-testid="table-test">
          <tbody>
            <tr>
              <td>Cell content</td>
            </tr>
          </tbody>
        </Table>
      );
      
      const table = screen.getByTestId('table-test');
      expect(table).toHaveClass('custom-table');
    });
  });

  describe('TableHeader', () => {
    it('renders with default props', () => {
      render(
        <table>
          <TableHeader data-testid="table-header-test">
            <tr>
              <th>Header cell</th>
            </tr>
          </TableHeader>
        </table>
      );
      
      const tableHeader = screen.getByTestId('table-header-test');
      expect(tableHeader).toBeInTheDocument();
      expect(tableHeader).toHaveClass('[&_tr]:border-b');
    });

    it('applies custom className', () => {
      render(
        <table>
          <TableHeader className="custom-header" data-testid="table-header-test">
            <tr>
              <th>Header cell</th>
            </tr>
          </TableHeader>
        </table>
      );
      
      const tableHeader = screen.getByTestId('table-header-test');
      expect(tableHeader).toHaveClass('custom-header');
    });
  });

  describe('TableBody', () => {
    it('renders with default props', () => {
      render(
        <table>
          <TableBody data-testid="table-body-test">
            <tr>
              <td>Body cell</td>
            </tr>
          </TableBody>
        </table>
      );
      
      const tableBody = screen.getByTestId('table-body-test');
      expect(tableBody).toBeInTheDocument();
      expect(tableBody).toHaveClass('[&_tr:last-child]:border-0');
    });

    it('applies custom className', () => {
      render(
        <table>
          <TableBody className="custom-body" data-testid="table-body-test">
            <tr>
              <td>Body cell</td>
            </tr>
          </TableBody>
        </table>
      );
      
      const tableBody = screen.getByTestId('table-body-test');
      expect(tableBody).toHaveClass('custom-body');
    });
  });

  describe('TableFooter', () => {
    it('renders with default props', () => {
      render(
        <table>
          <TableFooter data-testid="table-footer-test">
            <tr>
              <td>Footer cell</td>
            </tr>
          </TableFooter>
        </table>
      );
      
      const tableFooter = screen.getByTestId('table-footer-test');
      expect(tableFooter).toBeInTheDocument();
      expect(tableFooter).toHaveClass('border-t');
      expect(tableFooter).toHaveClass('bg-muted/50');
      expect(tableFooter).toHaveClass('font-medium');
    });

    it('applies custom className', () => {
      render(
        <table>
          <TableFooter className="custom-footer" data-testid="table-footer-test">
            <tr>
              <td>Footer cell</td>
            </tr>
          </TableFooter>
        </table>
      );
      
      const tableFooter = screen.getByTestId('table-footer-test');
      expect(tableFooter).toHaveClass('custom-footer');
    });
  });

  describe('TableRow', () => {
    it('renders with default props', () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="table-row-test">
              <td>Row cell</td>
            </TableRow>
          </tbody>
        </table>
      );
      
      const tableRow = screen.getByTestId('table-row-test');
      expect(tableRow).toBeInTheDocument();
      expect(tableRow).toHaveClass('border-b');
      expect(tableRow).toHaveClass('transition-colors');
      expect(tableRow).toHaveClass('hover:bg-muted/50');
    });

    it('applies custom className', () => {
      render(
        <table>
          <tbody>
            <TableRow className="custom-row" data-testid="table-row-test">
              <td>Row cell</td>
            </TableRow>
          </tbody>
        </table>
      );
      
      const tableRow = screen.getByTestId('table-row-test');
      expect(tableRow).toHaveClass('custom-row');
    });
  });

  describe('TableHead', () => {
    it('renders with default props', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead data-testid="table-head-test">Head cell</TableHead>
            </tr>
          </thead>
        </table>
      );
      
      const tableHead = screen.getByTestId('table-head-test');
      expect(tableHead).toBeInTheDocument();
      expect(tableHead).toHaveClass('h-12');
      expect(tableHead).toHaveClass('px-4');
      expect(tableHead).toHaveClass('text-left');
      expect(tableHead).toHaveClass('align-middle');
      expect(tableHead).toHaveClass('font-medium');
      expect(tableHead).toHaveClass('text-muted-foreground');
    });

    it('applies custom className', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead className="custom-head" data-testid="table-head-test">Head cell</TableHead>
            </tr>
          </thead>
        </table>
      );
      
      const tableHead = screen.getByTestId('table-head-test');
      expect(tableHead).toHaveClass('custom-head');
    });
  });

  describe('TableCell', () => {
    it('renders with default props', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="table-cell-test">Cell content</TableCell>
            </tr>
          </tbody>
        </table>
      );
      
      const tableCell = screen.getByTestId('table-cell-test');
      expect(tableCell).toBeInTheDocument();
      expect(tableCell).toHaveClass('p-4');
      expect(tableCell).toHaveClass('align-middle');
    });

    it('applies custom className', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell className="custom-cell" data-testid="table-cell-test">Cell content</TableCell>
            </tr>
          </tbody>
        </table>
      );
      
      const tableCell = screen.getByTestId('table-cell-test');
      expect(tableCell).toHaveClass('custom-cell');
    });
  });

  describe('TableCaption', () => {
    it('renders with default props', () => {
      render(
        <table>
          <TableCaption data-testid="table-caption-test">Table caption</TableCaption>
        </table>
      );
      
      const tableCaption = screen.getByTestId('table-caption-test');
      expect(tableCaption).toBeInTheDocument();
      expect(tableCaption).toHaveClass('mt-4');
      expect(tableCaption).toHaveClass('text-sm');
      expect(tableCaption).toHaveClass('text-muted-foreground');
    });

    it('applies custom className', () => {
      render(
        <table>
          <TableCaption className="custom-caption" data-testid="table-caption-test">Table caption</TableCaption>
        </table>
      );
      
      const tableCaption = screen.getByTestId('table-caption-test');
      expect(tableCaption).toHaveClass('custom-caption');
    });
  });

  it('renders a complete table example', () => {
    render(
      <Table>
        <TableCaption>A list of recent invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell className="text-right">$250.00</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">$250.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    
    expect(screen.getByText('A list of recent invoices')).toBeInTheDocument();
    expect(screen.getByText('Invoice')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Method')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('INV001')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    expect(screen.getAllByText('$250.00')).toHaveLength(2);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});
