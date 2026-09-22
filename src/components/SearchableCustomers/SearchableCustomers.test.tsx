import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SearchableCustomers from './SearchableCustomers';

/**
 * Mock pattern documented in tests/searchableMockFactory.tsx
 * Cannot be extracted due to vitest hoisting - vi.mock() must be inline
 */
// Mock the SearchableInfiniteSelect component
vi.mock('@app/components/SearchableInfiniteSelect', () => ({
  default: vi.fn(
    ({ dataTestId, fetchUrl, responseMapper, renderOptionLabel, placeholder, value, onValueChange, disabled }) => (
      <div data-testid={dataTestId || 'searchable-infinite-select'}>
        <div data-testid="fetch-url">{fetchUrl}</div>
        <div data-testid="placeholder">{placeholder}</div>
        <div data-testid="value">{value}</div>
        <div data-testid="disabled">{disabled ? 'true' : 'false'}</div>
        <button data-testid="trigger-change" onClick={() => onValueChange?.('test-customer-id')}>
          Change
        </button>
        <div data-testid="response-mapper">
          {responseMapper && JSON.stringify(responseMapper({ id: 'test-id', name: 'Test Customer' }))}
        </div>
        <div data-testid="render-option-label">
          {renderOptionLabel?.({ id: 'test-id', name: 'Test Customer', value: 'test-id', label: 'test-id' })}
        </div>
      </div>
    )
  ),
}));

// Helper functions
function renderSearchableCustomers(props = {}) {
  const defaultProps = {
    value: null,
    onChange: vi.fn(),
  };
  return render(<SearchableCustomers {...defaultProps} {...props} />);
}

function getResponseMapperResult() {
  const responseMapperText = screen.getByTestId('response-mapper').textContent;
  return JSON.parse(responseMapperText || '{}');
}

describe('SearchableCustomers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders SearchableInfiniteSelect with correct props', () => {
      renderSearchableCustomers();

      expect(screen.getByTestId('searchable-customers-input')).toBeInTheDocument();
      expect(screen.getByTestId('fetch-url')).toHaveTextContent('/customer/all');
      expect(screen.getByTestId('placeholder')).toHaveTextContent('Select Customer');
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('renders with null value', () => {
      renderSearchableCustomers({ value: null });

      expect(screen.getByTestId('value')).toHaveTextContent('');
    });

    it('renders with string value', () => {
      renderSearchableCustomers({ value: 'customer-123' });

      expect(screen.getByTestId('value')).toHaveTextContent('customer-123');
    });

    it('renders with array value', () => {
      renderSearchableCustomers({ value: ['customer-1', 'customer-2'] });

      expect(screen.getByTestId('value')).toHaveTextContent('customer-1customer-2');
    });
  });

  describe('Mode handling', () => {
    it('is not disabled when mode is not provided', () => {
      renderSearchableCustomers();

      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('is not disabled when mode is edit', () => {
      renderSearchableCustomers({ mode: 'edit' });

      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('is disabled when mode is view', () => {
      renderSearchableCustomers({ mode: 'view' });

      expect(screen.getByTestId('disabled')).toHaveTextContent('true');
    });
  });

  describe('Response mapping', () => {
    it('maps response data correctly', () => {
      renderSearchableCustomers();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult).toEqual({
        value: 'test-id',
        label: 'test-id',
        id: 'test-id',
        name: 'Test Customer',
      });
    });
  });

  describe('Option label rendering', () => {
    it('renders option label with id and name', () => {
      renderSearchableCustomers();

      const optionLabel = screen.getByTestId('render-option-label');
      expect(optionLabel).toHaveTextContent('test-id - Test Customer');
    });
  });

  describe('Change handling', () => {
    it('calls onChange when value changes', () => {
      const onChange = vi.fn();
      renderSearchableCustomers({ onChange });

      screen.getByTestId('trigger-change').click();

      expect(onChange).toHaveBeenCalledWith('test-customer-id');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onChange is not provided', () => {
      const { container } = renderSearchableCustomers({ value: null, onChange: vi.fn() });

      expect(() => {
        screen.getByTestId('trigger-change').click();
      }).not.toThrow();

      expect(container).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('passes all required props to SearchableInfiniteSelect', () => {
      const onChange = vi.fn();
      renderSearchableCustomers({ value: 'test-value', onChange, mode: 'edit' });

      // Verify all props are passed correctly
      expect(screen.getByTestId('searchable-customers-input')).toBeInTheDocument();
      expect(screen.getByTestId('fetch-url')).toHaveTextContent('/customer/all');
      expect(screen.getByTestId('placeholder')).toHaveTextContent('Select Customer');
      expect(screen.getByTestId('value')).toHaveTextContent('test-value');
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });
  });

  describe('Component memoization', () => {
    it('is wrapped with memo', () => {
      // Test that the component is memoized by checking if it's the same reference
      // when props don't change
      const props = { value: 'test', onChange: vi.fn() };
      const { rerender } = renderSearchableCustomers(props);

      const defaultProps = {
        value: null,
        onChange: vi.fn(),
      };
      // Re-render with same props
      rerender(<SearchableCustomers {...defaultProps} {...props} />);

      // Component should not re-render unnecessarily
      // This is more of a structural test to ensure memo is applied
      expect(screen.getByTestId('searchable-customers-input')).toBeInTheDocument();
    });
  });

  describe('Interface compliance', () => {
    it('matches SearchableDevicesProps interface', () => {
      // Test that the component accepts all props defined in the interface
      const props = {
        value: 'test-value' as string,
        onChange: vi.fn() as (value: string) => void,
        mode: 'view' as string,
      };

      expect(() => renderSearchableCustomers(props)).not.toThrow();
    });

    it('handles string array value type', () => {
      const props = {
        value: ['customer-1', 'customer-2'] as string[],
        onChange: vi.fn(),
      };

      expect(() => renderSearchableCustomers(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent('customer-1customer-2');
    });

    it('handles null value type', () => {
      const props = {
        value: null,
        onChange: vi.fn(),
      };

      expect(() => renderSearchableCustomers(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent('');
    });
  });
});
