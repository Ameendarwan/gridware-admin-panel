import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import ErrorRows from './ErrorRows';
import { ErrorRowsProps } from './types';
import { Issue, Validation } from '@app/pages/Deployments/components/SideFilters/types';

// Mock the ValidationError component
vi.mock('@app/pages/Deployments/components/SideFilters/components/ValidationError/ValidationError', () => ({
  default: ({ issue, icon, color, handleIgnoreIssue }: any) => (
    <div data-testid="validation-error">
      <div data-testid="error-id">{issue.id}</div>
      <div data-testid="error-icon">{icon}</div>
      <div data-testid="error-color">{color}</div>
      <button data-testid="ignore-button" onClick={e => handleIgnoreIssue?.(e, issue.id)}>
        Ignore Issue
      </button>
    </div>
  ),
}));

// Mock the Separator component
vi.mock('@app/components/Separator/Separator', () => ({
  Separator: () => <div data-testid="separator" />,
}));

describe('ErrorRows', () => {
  const mockIssue: Issue = {
    id: 'test-error-1',
    entity: 'pole',
    classifier: 'missing_gps_info',
    ids: [123, 456],
    hint: 'Test hint message',
    error: 'Test error message',
    is_warning: true,
    isIgnored: false,
    title: 'Test Error Title',
    coordinates: {
      lat: 40.7128,
      long: -74.006,
    },
  };

  const mockSelectedStage: Validation = {
    step: 1,
    icon: 'warning',
    tabTitle: 'Test Stage',
    activeColor: 'red',
    stepTitle: 'Test Step',
    buttonTitle: 'Test Button',
    isCompleted: false,
  };

  const mockSetErrors = vi.fn();
  const mockSetIgnorableIssues = vi.fn();
  const mockSetRowHeight = vi.fn();

  const defaultProps: ErrorRowsProps = {
    index: 0,
    style: { position: 'absolute', top: 0, left: 0, width: 100, height: 50 },
    data: {
      errors: [mockIssue],
      selectedStage: mockSelectedStage,
      setErrors: mockSetErrors,
      setIgnorableIssues: mockSetIgnorableIssues,
      setRowHeight: mockSetRowHeight,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock getBoundingClientRect with a simple implementation
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      height: 100,
      width: 200,
      top: 0,
      left: 0,
      bottom: 100,
      right: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
  });

  describe('Rendering', () => {
    it('renders the error row with correct structure', () => {
      render(<ErrorRows {...defaultProps} />);

      expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      expect(screen.getByTestId('separator')).toBeInTheDocument();
      expect(screen.getByTestId('error-id')).toHaveTextContent('test-error-1');
      expect(screen.getByTestId('error-icon')).toHaveTextContent('warning');
      expect(screen.getByTestId('error-color')).toHaveTextContent('red');
    });

    it('applies the correct style', () => {
      const customStyle = { position: 'absolute' as const, top: 10, left: 5, width: 150, height: 75 };
      const props = { ...defaultProps, style: customStyle };

      const { container } = render(<ErrorRows {...props} />);
      const errorRowDiv = container.firstChild as HTMLElement;

      expect(errorRowDiv).toHaveStyle({
        position: 'absolute',
        top: '10px',
        left: '5px',
        width: '150px',
        height: 'auto', // height is overridden to 'auto'
      });
    });

    it('returns null when error is not provided', () => {
      const propsWithoutError = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          errors: [],
        },
      };

      const { container } = render(<ErrorRows {...propsWithoutError} />);
      expect(container.firstChild).toBeNull();
    });

    it('returns null when error at index does not exist', () => {
      const propsWithHighIndex = {
        ...defaultProps,
        index: 5, // Index beyond array length
      };

      const { container } = render(<ErrorRows {...propsWithHighIndex} />);
      expect(container.firstChild).toBeNull();
    });

    it('handles undefined errors array gracefully', () => {
      const propsWithUndefinedErrors = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          errors: undefined as any,
        },
      };

      const { container } = render(<ErrorRows {...propsWithUndefinedErrors} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Props and Data', () => {
    it('passes correct props to ValidationError component', () => {
      render(<ErrorRows {...defaultProps} />);

      expect(screen.getByTestId('error-id')).toHaveTextContent('test-error-1');
      expect(screen.getByTestId('error-icon')).toHaveTextContent('warning');
      expect(screen.getByTestId('error-color')).toHaveTextContent('red');
    });

    it('handles multiple errors in the data array correctly', () => {
      const secondError: Issue = {
        ...mockIssue,
        id: 'test-error-2',
        error: 'Second error message',
      };

      const propsWithMultipleErrors = {
        ...defaultProps,
        index: 1, // Render the second error
        data: {
          ...defaultProps.data,
          errors: [mockIssue, secondError],
        },
      };

      render(<ErrorRows {...propsWithMultipleErrors} />);

      expect(screen.getByTestId('error-id')).toHaveTextContent('test-error-2');
    });

    it('renders with different error types correctly', () => {
      const deviceError: Issue = {
        id: 'device-error-1',
        entity: 'device',
        classifier: 'location_discrepancy',
        ids: [789],
        hint: 'Device hint',
        error: 'Device error',
        is_warning: false,
        isIgnored: false,
      };

      const propsWithDeviceError = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          errors: [deviceError],
        },
      };

      render(<ErrorRows {...propsWithDeviceError} />);

      expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      expect(screen.getByTestId('error-id')).toHaveTextContent('device-error-1');
    });
  });

  describe('Ignore Issue Functionality', () => {
    it('handles ignore issue click correctly', () => {
      render(<ErrorRows {...defaultProps} />);

      const ignoreButton = screen.getByTestId('ignore-button');
      fireEvent.click(ignoreButton);

      expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function));
      expect(mockSetIgnorableIssues).toHaveBeenCalledWith(expect.any(Function));
    });

    it('toggles isIgnored status when ignore button is clicked', () => {
      render(<ErrorRows {...defaultProps} />);

      const ignoreButton = screen.getByTestId('ignore-button');
      fireEvent.click(ignoreButton);

      // Test the function that was passed to setErrors
      const setErrorsCallback = mockSetErrors.mock.calls[0][0];
      const mockPrevErrors = [
        { ...mockIssue, isIgnored: false },
        { id: 'other-error', isIgnored: true },
      ];

      const result = setErrorsCallback(mockPrevErrors);

      expect(result).toEqual([
        { ...mockIssue, isIgnored: true }, // Should toggle to true
        { id: 'other-error', isIgnored: true }, // Should remain unchanged
      ]);
    });

    it('adds issue ID to ignorable issues when ignore button is clicked', () => {
      render(<ErrorRows {...defaultProps} />);

      const ignoreButton = screen.getByTestId('ignore-button');
      fireEvent.click(ignoreButton);

      // Test the function that was passed to setIgnorableIssues
      const setIgnorableIssuesCallback = mockSetIgnorableIssues.mock.calls[0][0];
      const mockPrevIgnorableIssues = ['existing-id'];

      const result = setIgnorableIssuesCallback(mockPrevIgnorableIssues);

      expect(result).toEqual(['existing-id', 'test-error-1']);
    });

    it('prevents duplicate entries in ignorable issues', () => {
      render(<ErrorRows {...defaultProps} />);

      const ignoreButton = screen.getByTestId('ignore-button');
      fireEvent.click(ignoreButton);

      const setIgnorableIssuesCallback = mockSetIgnorableIssues.mock.calls[0][0];
      const mockPrevIgnorableIssues = ['test-error-1', 'other-id']; // Already contains the ID

      const result = setIgnorableIssuesCallback(mockPrevIgnorableIssues);

      // Should not duplicate the ID
      expect(result).toEqual(['test-error-1', 'other-id']);
    });
  });

  describe('Component Structure', () => {
    it('renders with correct key attribute', () => {
      const { container } = render(<ErrorRows {...defaultProps} />);
      const errorRowDiv = container.firstChild as HTMLElement;

      expect(errorRowDiv).toHaveAttribute('style');
      expect(errorRowDiv.getAttribute('key')).toBeNull(); // Key doesn't appear as DOM attribute
    });

    it('combines style props correctly', () => {
      const customStyle = { position: 'absolute' as const, top: 20, left: 10, width: 300 };
      const props = { ...defaultProps, style: customStyle };

      const { container } = render(<ErrorRows {...props} />);
      const errorRowDiv = container.firstChild as HTMLElement;

      expect(errorRowDiv).toHaveStyle({
        position: 'absolute',
        top: '20px',
        left: '10px',
        width: '300px',
        height: 'auto',
      });
    });
  });
});
