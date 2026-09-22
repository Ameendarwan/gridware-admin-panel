import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImportSummary from './ImportSummary';
import { ImportSummary as ImportSummaryType } from '../types';

// Mock the Dialog components
vi.mock('@app/components/Dialog/Dialog', () => ({
  DialogDescription: ({ children, className }: any) => (
    <div data-testid="dialog-description" className={className}>
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

describe('ImportSummary', () => {
  const createImportSummary = (overrides?: Partial<ImportSummaryType>): ImportSummaryType => ({
    warnings: [],
    errors: [],
    poles_created: [],
    poles_updated: [],
    poles_skipped: [],
    device_installs_created: [],
    device_installs_skipped: [],
    pole_neighbors_created: 0,
    pole_neighbors_skipped: 0,
    pole_equipment_updated: [],
    pole_equipment_skipped: [],
    photos_uploaded: [],
    photos_skipped: [],
    ...overrides,
  });

  it('should render import summary with all statistics', () => {
    const importSummary = createImportSummary({
      poles_created: ['pole1', 'pole2'],
      poles_updated: ['pole3', 'pole4', 'pole5'],
      device_installs_created: ['device1'],
      pole_neighbors_created: 10,
      photos_uploaded: ['photo1', 'photo2', 'photo3', 'photo4'],
    });

    render(<ImportSummary importSummary={importSummary} />);

    expect(screen.getByText('Poles Created:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    expect(screen.getByText('Poles Updated:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    expect(screen.getByText('Device Installs Created:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    expect(screen.getByText('Pole Neighbors Created:')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('Photos Uploaded:')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should display zero counts when arrays are empty', () => {
    const importSummary = createImportSummary();

    render(<ImportSummary importSummary={importSummary} />);

    const zeroElements = screen.getAllByText('0');
    expect(zeroElements).toHaveLength(5); // All counts should be 0
  });

  it('should not display error section when there are no errors', () => {
    const importSummary = createImportSummary({
      errors: [],
    });

    render(<ImportSummary importSummary={importSummary} />);

    expect(screen.queryByTestId('alert-circle-icon')).not.toBeInTheDocument();
    expect(screen.queryByText(/Error.*Found/)).not.toBeInTheDocument();
  });

  it('should display error section with single error', () => {
    const importSummary = createImportSummary({
      errors: ['Failed to import pole ABC123'],
    });

    render(<ImportSummary importSummary={importSummary} />);

    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    expect(screen.getByText('1 Error Found')).toBeInTheDocument();
    expect(screen.getByText('Failed to import pole ABC123')).toBeInTheDocument();
  });

  it('should display error section with multiple errors', () => {
    const importSummary = createImportSummary({
      errors: ['Failed to import pole ABC123', 'Device XYZ789 not found', 'Invalid photo format for photo1.jpg'],
    });

    render(<ImportSummary importSummary={importSummary} />);

    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    expect(screen.getByText('3 Errors Found')).toBeInTheDocument();
    expect(screen.getByText('Failed to import pole ABC123')).toBeInTheDocument();
    expect(screen.getByText('Device XYZ789 not found')).toBeInTheDocument();
    expect(screen.getByText('Invalid photo format for photo1.jpg')).toBeInTheDocument();
  });

  it('should handle null or undefined values gracefully', () => {
    const importSummary = {
      warnings: [],
      errors: [],
      poles_created: null as any,
      poles_updated: undefined as any,
      device_installs_created: null as any,
      pole_neighbors_created: undefined as any,
      photos_uploaded: undefined as any,
      poles_skipped: [],
      device_installs_skipped: [],
      pole_neighbors_skipped: 0,
      pole_equipment_updated: [],
      pole_equipment_skipped: [],
      photos_skipped: [],
    };

    render(<ImportSummary importSummary={importSummary} />);

    // All counts should show 0 for null/undefined values
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThanOrEqual(4);
  });

  it('should render with proper CSS classes', () => {
    const importSummary = createImportSummary();
    const { container } = render(<ImportSummary importSummary={importSummary} />);

    const dialogDescription = screen.getByTestId('dialog-description');
    expect(dialogDescription).toHaveClass('!mt-4 text-xs text-primary');

    const gridContainer = container.querySelector('.grid.grid-cols-2.gap-2.text-xs');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should display error section with proper styling', () => {
    const importSummary = createImportSummary({
      errors: ['Test error'],
    });

    const { container } = render(<ImportSummary importSummary={importSummary} />);

    const errorContainer = container.querySelector('.rounded-lg.border.border-red-200.bg-red-50.p-3');
    expect(errorContainer).toBeInTheDocument();

    const errorTitle = container.querySelector('.font-semibold.text-red-900');
    expect(errorTitle).toBeInTheDocument();

    const errorItem = container.querySelector('.text-red-700');
    expect(errorItem).toBeInTheDocument();

    const bulletPoint = container.querySelector('.rounded-full.bg-red-400');
    expect(bulletPoint).toBeInTheDocument();
  });

  it('should handle very long error messages with scrolling', () => {
    const longErrors = Array.from(
      { length: 10 },
      (_, i) => `This is a very long error message number ${i + 1} that should be contained within the scrollable area`
    );

    const importSummary = createImportSummary({
      errors: longErrors,
    });

    const { container } = render(<ImportSummary importSummary={importSummary} />);

    const scrollableContainer = container.querySelector('.max-h-32.overflow-y-auto');
    expect(scrollableContainer).toBeInTheDocument();

    // All errors should be rendered
    for (const error of longErrors) {
      expect(screen.getByText(error)).toBeInTheDocument();
    }
  });

  it('should display all statistics in a grid layout', () => {
    const importSummary = createImportSummary({
      poles_created: ['pole1'],
      poles_updated: ['pole2', 'pole3'],
      device_installs_created: ['device1', 'device2', 'device3'],
      pole_neighbors_created: 5,
      photos_uploaded: ['photo1', 'photo2'],
    });

    const { container } = render(<ImportSummary importSummary={importSummary} />);

    const gridItems = container.querySelectorAll('.grid-cols-2 > div');
    expect(gridItems.length).toBe(5);

    // Check that each statistic is displayed with bold numbers
    const boldElements = container.querySelectorAll('.font-bold');
    expect(boldElements).toHaveLength(5);

    const values = Array.from(boldElements).map(el => el.textContent);
    expect(values).toContain('1'); // poles_created
    expect(values).toContain('2'); // poles_updated
    expect(values).toContain('3'); // device_installs_created
    expect(values).toContain('5'); // pole_neighbors_created
    expect(values).toContain('2'); // photos_uploaded
  });
});
