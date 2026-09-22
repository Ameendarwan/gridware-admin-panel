import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImportToProductionDialog from './ImportToProductionDialog';
import { ImportToProductionDialogProps } from './types';

// Mock the custom hook
vi.mock('@app/pages/Deployments/hooks/useImportToProduction', () => ({
  default: vi.fn(() => ({
    importErrorMessage: '',
    importSummary: null,
    showImportDialog: false,
    importState: 'confirm',
    shouldShowButton: true,
    isLoading: false,
    handleDownloadReport: vi.fn(),
    handleImportToProduction: vi.fn(),
    handleConfirmImport: vi.fn(),
    handleCloseImportDialog: vi.fn(),
  })),
}));

// Mock the components
vi.mock('@app/components/Button/Button', () => ({
  Button: ({ children, onClick, className, variant }: any) => (
    <button onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('@app/components/Loader/Loader', () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

vi.mock('@app/components/Dialog/Dialog', () => ({
  Dialog: ({ children, open }: any) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children, className }: any) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  ),
  DialogDescription: ({ children, className }: any) => (
    <div data-testid="dialog-description" className={className}>
      {children}
    </div>
  ),
  DialogFooter: ({ children, className }: any) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('./ImportSummary/ImportSummary', () => ({
  default: ({ importSummary }: any) => <div data-testid="import-summary">{JSON.stringify(importSummary)}</div>,
}));

import useImportToProduction from '@app/pages/Deployments/hooks/useImportToProduction';

const mockedUseImportToProduction = vi.mocked(useImportToProduction);

describe('ImportToProductionDialog', () => {
  const defaultProps: ImportToProductionDialogProps = {
    deploymentId: '123',
    deploymentName: 'Test Deployment',
    exportData: { data: 'test' },
    className: 'test-class',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock implementation
    mockedUseImportToProduction.mockReturnValue({
      importErrorMessage: '',
      importSummary: null,
      showImportDialog: false,
      importState: 'confirm',
      shouldShowButton: true,
      isLoading: false,
      handleDownloadReport: vi.fn(),
      handleImportToProduction: vi.fn(),
      handleConfirmImport: vi.fn(),
      handleCloseImportDialog: vi.fn(),
    } as any);
  });

  it('should render nothing when shouldShowButton is false', () => {
    mockedUseImportToProduction.mockReturnValue({
      importErrorMessage: '',
      importSummary: null,
      showImportDialog: false,
      importState: 'confirm',
      shouldShowButton: false,
      isLoading: false,
      handleDownloadReport: vi.fn(),
      handleImportToProduction: vi.fn(),
      handleConfirmImport: vi.fn(),
      handleCloseImportDialog: vi.fn(),
    } as any);

    const { container } = render(<ImportToProductionDialog {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the import button when shouldShowButton is true', () => {
    // Uses default mock from beforeEach which has shouldShowButton: true
    render(<ImportToProductionDialog {...defaultProps} />);

    const button = screen.getByText('Import data into Production');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('test-class');
    expect(button).toHaveAttribute('data-variant', 'muted');
  });

  it('should call handleImportToProduction when button is clicked', () => {
    const handleImportToProduction = vi.fn();
    mockedUseImportToProduction.mockReturnValue({
      importErrorMessage: '',
      importSummary: null,
      showImportDialog: false,
      importState: 'confirm',
      shouldShowButton: true,
      isLoading: false,
      handleDownloadReport: vi.fn(),
      handleImportToProduction,
      handleConfirmImport: vi.fn(),
      handleCloseImportDialog: vi.fn(),
    } as any);

    render(<ImportToProductionDialog {...defaultProps} />);
    const button = screen.getByText('Import data into Production');
    fireEvent.click(button);
    expect(handleImportToProduction).toHaveBeenCalled();
  });

  describe('Dialog states', () => {
    it('should show confirm state dialog', () => {
      mockedUseImportToProduction.mockReturnValue({
        importErrorMessage: '',
        importSummary: null,
        showImportDialog: true,
        importState: 'confirm',
        shouldShowButton: true,
        isLoading: false,
        handleDownloadReport: vi.fn(),
        handleImportToProduction: vi.fn(),
        handleConfirmImport: vi.fn(),
        handleCloseImportDialog: vi.fn(),
      } as any);

      render(<ImportToProductionDialog {...defaultProps} />);

      expect(screen.getByText('Import deployment to Production')).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
      expect(screen.getByText('Import')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockedUseImportToProduction.mockReturnValue({
        importErrorMessage: '',
        importSummary: null,
        showImportDialog: true,
        importState: 'loading',
        shouldShowButton: true,
        isLoading: true,
        handleDownloadReport: vi.fn(),
        handleImportToProduction: vi.fn(),
        handleConfirmImport: vi.fn(),
        handleCloseImportDialog: vi.fn(),
      } as any);

      render(<ImportToProductionDialog {...defaultProps} />);

      expect(screen.getByText('Importing deployment...')).toBeInTheDocument();
      expect(screen.getByText("Importing… This can take a little while. Don't close this window.")).toBeInTheDocument();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should show complete state with import summary', () => {
      const importSummary = {
        warnings: [],
        errors: [],
        poles_created: ['pole1', 'pole2'],
        poles_updated: ['pole3'],
        device_installs_created: ['device1'],
        pole_neighbors_created: 5,
        photos_uploaded: ['photo1', 'photo2', 'photo3'],
      };

      mockedUseImportToProduction.mockReturnValue({
        importErrorMessage: '',
        importSummary,
        showImportDialog: true,
        importState: 'complete',
        shouldShowButton: true,
        isLoading: false,
        handleDownloadReport: vi.fn(),
        handleImportToProduction: vi.fn(),
        handleConfirmImport: vi.fn(),
        handleCloseImportDialog: vi.fn(),
      } as any);

      render(<ImportToProductionDialog {...defaultProps} />);

      expect(screen.getByText('Import completed!')).toBeInTheDocument();
      expect(screen.getByTestId('import-summary')).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
      expect(screen.getByText('Download Report Again')).toBeInTheDocument();
    });

    it('should show failed state with error message', () => {
      const errorMessage = 'Failed to import deployment';
      mockedUseImportToProduction.mockReturnValue({
        importErrorMessage: errorMessage,
        importSummary: null,
        showImportDialog: true,
        importState: 'failed',
        shouldShowButton: true,
        isLoading: false,
        handleDownloadReport: vi.fn(),
        handleImportToProduction: vi.fn(),
        handleConfirmImport: vi.fn(),
        handleCloseImportDialog: vi.fn(),
      } as any);

      render(<ImportToProductionDialog {...defaultProps} />);

      expect(screen.getByText('Import failed')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
      expect(screen.getByText('Import again')).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    it('should call handleCloseImportDialog when Close button is clicked', () => {
      const handleCloseImportDialog = vi.fn();
      mockedUseImportToProduction.mockReturnValue({
        importErrorMessage: '',
        importSummary: null,
        showImportDialog: true,
        importState: 'confirm',
        shouldShowButton: true,
        isLoading: false,
        handleDownloadReport: vi.fn(),
        handleImportToProduction: vi.fn(),
        handleConfirmImport: vi.fn(),
        handleCloseImportDialog,
      } as any);

      render(<ImportToProductionDialog {...defaultProps} />);
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      expect(handleCloseImportDialog).toHaveBeenCalled();
    });

    it('should call handleConfirmImport when Import button is clicked', () => {
      const handleConfirmImport = vi.fn();
      mockedUseImportToProduction.mockReturnValue({
        importErrorMessage: '',
        importSummary: null,
        showImportDialog: true,
        importState: 'confirm',
        shouldShowButton: true,
        isLoading: false,
        handleDownloadReport: vi.fn(),
        handleImportToProduction: vi.fn(),
        handleConfirmImport,
        handleCloseImportDialog: vi.fn(),
      } as any);

      render(<ImportToProductionDialog {...defaultProps} />);
      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);
      expect(handleConfirmImport).toHaveBeenCalled();
    });

    it('should call handleDownloadReport when Download Report Again button is clicked', () => {
      const handleDownloadReport = vi.fn();
      mockedUseImportToProduction.mockReturnValue({
        importErrorMessage: '',
        importSummary: {},
        showImportDialog: true,
        importState: 'complete',
        shouldShowButton: true,
        isLoading: false,
        handleDownloadReport,
        handleImportToProduction: vi.fn(),
        handleConfirmImport: vi.fn(),
        handleCloseImportDialog: vi.fn(),
      } as any);

      render(<ImportToProductionDialog {...defaultProps} />);
      const downloadButton = screen.getByText('Download Report Again');
      fireEvent.click(downloadButton);
      expect(handleDownloadReport).toHaveBeenCalled();
    });

    it('should call handleConfirmImport when Import again button is clicked in failed state', () => {
      const handleConfirmImport = vi.fn();
      mockedUseImportToProduction.mockReturnValue({
        importErrorMessage: 'Error',
        importSummary: null,
        showImportDialog: true,
        importState: 'failed',
        shouldShowButton: true,
        isLoading: false,
        handleDownloadReport: vi.fn(),
        handleImportToProduction: vi.fn(),
        handleConfirmImport,
        handleCloseImportDialog: vi.fn(),
      } as any);

      render(<ImportToProductionDialog {...defaultProps} />);
      const importAgainButton = screen.getByText('Import again');
      fireEvent.click(importAgainButton);
      expect(handleConfirmImport).toHaveBeenCalled();
    });
  });

  describe('Props and styling', () => {
    it('should use default className when not provided', () => {
      const props = { ...defaultProps, className: undefined };
      render(<ImportToProductionDialog {...props} />);
      const button = screen.getByText('Import data into Production');
      expect(button).toHaveClass('w-full text-xs');
    });

    it('should apply correct title styles based on importState', () => {
      const states = [
        { importState: 'failed' as const, expectedClass: 'text-red-600' },
        { importState: 'complete' as const, expectedClass: 'text-green-600' },
      ];

      for (const { importState, expectedClass } of states) {
        mockedUseImportToProduction.mockReturnValue({
          importErrorMessage: '',
          importSummary: importState === 'complete' ? {} : null,
          showImportDialog: true,
          importState,
          shouldShowButton: true,
          isLoading: false,
          handleDownloadReport: vi.fn(),
          handleImportToProduction: vi.fn(),
          handleConfirmImport: vi.fn(),
          handleCloseImportDialog: vi.fn(),
        } as any);

        const { rerender } = render(<ImportToProductionDialog {...defaultProps} />);
        const title = screen.getByTestId('dialog-title');
        expect(title.className).toContain(expectedClass);
        rerender(<></>);
      }
    });
  });
});
