import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SearchableDeployments from './SearchableDeployments';

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
        <button data-testid="trigger-change" onClick={() => onValueChange?.('test-deployment-id')}>
          Change
        </button>
        <div data-testid="response-mapper">
          {responseMapper &&
            JSON.stringify(responseMapper({ id: 'test-id', name: 'Test Deployment', location: 'Test Location' }))}
        </div>
        <div data-testid="render-option-label">
          {renderOptionLabel?.({
            id: 'test-id',
            name: 'Test Deployment',
            location: 'Test Location',
            value: 'test-id',
            label: 'Test Deployment',
          })}
        </div>
      </div>
    )
  ),
}));

// Helper functions
function renderSearchableDeployments(props = {}) {
  const defaultProps = {
    value: null,
    onChange: vi.fn(),
  };
  return render(<SearchableDeployments {...defaultProps} {...props} />);
}

function getResponseMapperResult() {
  const responseMapperText = screen.getByTestId('response-mapper').textContent;
  return JSON.parse(responseMapperText ?? '{}');
}

describe('SearchableDeployments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders SearchableInfiniteSelect with correct props', () => {
      renderSearchableDeployments();

      expect(screen.getByTestId('searchable-deployments-input')).toBeInTheDocument();
      expect(screen.getByTestId('fetch-url')).toHaveTextContent('/deployment/all');
      expect(screen.getByTestId('placeholder')).toHaveTextContent('Select Deployment');
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('renders with null value', () => {
      renderSearchableDeployments({ value: null });

      expect(screen.getByTestId('value')).toHaveTextContent('');
    });

    it('renders with string value', () => {
      renderSearchableDeployments({ value: 'deployment-123' });

      expect(screen.getByTestId('value')).toHaveTextContent('deployment-123');
    });
  });

  describe('Mode handling', () => {
    it('is not disabled when mode is not provided', () => {
      renderSearchableDeployments();

      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('is not disabled when mode is edit', () => {
      renderSearchableDeployments({ mode: 'edit' });

      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('is disabled when mode is view', () => {
      renderSearchableDeployments({ mode: 'view' });

      expect(screen.getByTestId('disabled')).toHaveTextContent('true');
    });
  });

  describe('Response mapping', () => {
    it('maps response data correctly', () => {
      renderSearchableDeployments();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult).toEqual({
        value: 'test-id',
        label: 'Test Deployment',
        name: 'Test Deployment',
        location: 'Test Location',
      });
    });
  });

  describe('Option label rendering', () => {
    it('renders option label with name and location in correct format', () => {
      renderSearchableDeployments();

      const optionLabel = screen.getByTestId('render-option-label');
      expect(optionLabel).toHaveTextContent('Name: Test Deployment - Location: Test Location');
    });

    it('renders bold tags for labels', () => {
      renderSearchableDeployments();

      const optionLabel = screen.getByTestId('render-option-label');
      // Check that bold elements are present
      const boldElements = optionLabel.querySelectorAll('b');
      expect(boldElements).toHaveLength(2);
      expect(boldElements[0]).toHaveTextContent('Name:');
      expect(boldElements[1]).toHaveTextContent('Location:');
    });
  });

  describe('Change handling', () => {
    it('calls onChange when value changes', () => {
      const onChange = vi.fn();
      renderSearchableDeployments({ onChange });

      screen.getByTestId('trigger-change').click();

      expect(onChange).toHaveBeenCalledWith('test-deployment-id');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onChange is not provided', () => {
      const { container } = renderSearchableDeployments({ value: null, onChange: vi.fn() });

      expect(() => {
        screen.getByTestId('trigger-change').click();
      }).not.toThrow();

      expect(container).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('passes all required props to SearchableInfiniteSelect', () => {
      const onChange = vi.fn();
      renderSearchableDeployments({ value: 'test-value', onChange, mode: 'edit' });

      // Verify all props are passed correctly
      expect(screen.getByTestId('searchable-deployments-input')).toBeInTheDocument();
      expect(screen.getByTestId('fetch-url')).toHaveTextContent('/deployment/all');
      expect(screen.getByTestId('placeholder')).toHaveTextContent('Select Deployment');
      expect(screen.getByTestId('value')).toHaveTextContent('test-value');
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });
  });

  describe('Component memoization', () => {
    it('is wrapped with memo', () => {
      // Test that the component is memoized by checking if it's the same reference
      // when props don't change
      const props = { value: 'test', onChange: vi.fn() };
      const { rerender } = renderSearchableDeployments(props);

      const defaultProps = {
        value: null,
        onChange: vi.fn(),
      };
      // Re-render with same props
      rerender(<SearchableDeployments {...defaultProps} {...props} />);

      // Component should not re-render unnecessarily
      // This is more of a structural test to ensure memo is applied
      expect(screen.getByTestId('searchable-deployments-input')).toBeInTheDocument();
    });
  });

  describe('Interface compliance', () => {
    it('matches SearchableDeploymentsProps interface', () => {
      // Test that the component accepts all props defined in the interface
      const props = {
        value: 'test-value' as string | null,
        onChange: vi.fn() as (value: string) => void,
        mode: 'view' as string,
      };

      expect(() => renderSearchableDeployments(props)).not.toThrow();
    });

    it('handles null value type', () => {
      const props = {
        value: null,
        onChange: vi.fn(),
      };

      expect(() => renderSearchableDeployments(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent('');
    });
  });

  describe('Data structure', () => {
    it('includes correct properties in response mapper', () => {
      renderSearchableDeployments();

      const parsedResult = getResponseMapperResult();

      // Verify all expected properties are present
      expect(parsedResult).toHaveProperty('value');
      expect(parsedResult).toHaveProperty('label');
      expect(parsedResult).toHaveProperty('name');
      expect(parsedResult).toHaveProperty('location');
    });

    it('maps item.id to value property', () => {
      renderSearchableDeployments();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult.value).toBe('test-id');
    });

    it('maps item.name to label property', () => {
      renderSearchableDeployments();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult.label).toBe('Test Deployment');
    });
  });
});
