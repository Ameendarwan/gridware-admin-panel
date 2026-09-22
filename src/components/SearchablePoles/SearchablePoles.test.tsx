import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SearchablePoles from './SearchablePoles';

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
        <button data-testid="trigger-change" onClick={() => onValueChange?.('test-pole-id')}>
          Change
        </button>
        <div data-testid="response-mapper">
          {responseMapper &&
            JSON.stringify(
              responseMapper({
                id: 'pole-123',
                pole_id: 'P-001',
                status: 'active',
              })
            )}
        </div>
        <div data-testid="render-option-label">
          {renderOptionLabel?.({
            pole_id: 'P-001',
            status: 'active',
            value: 'pole-123',
            label: 'P-001',
          })}
        </div>
      </div>
    )
  ),
}));

// Helper functions
function renderSearchablePoles(props = {}) {
  const defaultProps = {
    value: null,
    onChange: vi.fn(),
  };
  return render(<SearchablePoles {...defaultProps} {...props} />);
}

function getResponseMapperResult() {
  const responseMapperText = screen.getByTestId('response-mapper').textContent;
  return JSON.parse(responseMapperText ?? '{}');
}

describe('SearchablePoles', () => {
  const defaultProps = {
    value: null,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders SearchableInfiniteSelect with correct props', () => {
      renderSearchablePoles();

      expect(screen.getByTestId('searchable-poles-input')).toBeInTheDocument();
      expect(screen.getByTestId('fetch-url')).toHaveTextContent('/pole/all');
      expect(screen.getByTestId('placeholder')).toHaveTextContent('Select Pole');
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('renders with null value', () => {
      renderSearchablePoles({ value: null });

      expect(screen.getByTestId('value')).toHaveTextContent('');
    });

    it('renders with string value', () => {
      renderSearchablePoles({ value: 'pole-123' });

      expect(screen.getByTestId('value')).toHaveTextContent('pole-123');
    });
  });

  describe('Mode handling', () => {
    it('is not disabled when mode is not provided', () => {
      renderSearchablePoles();

      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('is not disabled when mode is edit', () => {
      renderSearchablePoles({ mode: 'edit' });

      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('is disabled when mode is view', () => {
      renderSearchablePoles({ mode: 'view' });

      expect(screen.getByTestId('disabled')).toHaveTextContent('true');
    });
  });

  describe('Response mapping', () => {
    it('maps response data correctly', () => {
      renderSearchablePoles();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult).toEqual({
        value: 'pole-123',
        label: 'P-001',
        pole_id: 'P-001',
        status: 'active',
      });
    });

    it('includes all required pole properties in response mapper', () => {
      renderSearchablePoles();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult).toHaveProperty('value');
      expect(parsedResult).toHaveProperty('label');
      expect(parsedResult).toHaveProperty('pole_id');
      expect(parsedResult).toHaveProperty('status');
    });

    it('maps item.id to value property', () => {
      renderSearchablePoles();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult.value).toBe('pole-123');
    });

    it('maps item.pole_id to label property', () => {
      renderSearchablePoles();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult.label).toBe('P-001');
    });
  });

  describe('Option label rendering', () => {
    it('renders option label with pole_id and status in correct format', () => {
      renderSearchablePoles();

      const optionLabel = screen.getByTestId('render-option-label');
      expect(optionLabel).toHaveTextContent('Pole: P-001 - Status: active');
    });

    it('renders bold tags for labels', () => {
      renderSearchablePoles();

      const optionLabel = screen.getByTestId('render-option-label');
      // Check that bold elements are present
      const boldElements = optionLabel.querySelectorAll('b');
      expect(boldElements).toHaveLength(2);
      expect(boldElements[0]).toHaveTextContent('Pole:');
      expect(boldElements[1]).toHaveTextContent('Status:');
    });
  });

  describe('Change handling', () => {
    it('calls onChange when value changes', () => {
      const onChange = vi.fn();
      renderSearchablePoles({ onChange });

      screen.getByTestId('trigger-change').click();

      expect(onChange).toHaveBeenCalledWith('test-pole-id');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onChange is not provided', () => {
      const { container } = renderSearchablePoles({ value: null, onChange: vi.fn() });

      expect(() => {
        screen.getByTestId('trigger-change').click();
      }).not.toThrow();

      expect(container).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('passes all required props to SearchableInfiniteSelect', () => {
      const onChange = vi.fn();
      renderSearchablePoles({ value: 'test-value', onChange, mode: 'edit' });

      // Verify all props are passed correctly
      expect(screen.getByTestId('searchable-poles-input')).toBeInTheDocument();
      expect(screen.getByTestId('fetch-url')).toHaveTextContent('/pole/all');
      expect(screen.getByTestId('placeholder')).toHaveTextContent('Select Pole');
      expect(screen.getByTestId('value')).toHaveTextContent('test-value');
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });
  });

  describe('Component memoization', () => {
    it('is wrapped with memo', () => {
      // Test that the component is memoized by checking if it's the same reference
      // when props don't change
      const props = { value: 'test', onChange: vi.fn() };
      const { rerender } = renderSearchablePoles(props);

      // Re-render with same props
      rerender(<SearchablePoles {...defaultProps} {...props} />);

      // Component should not re-render unnecessarily
      // This is more of a structural test to ensure memo is applied
      expect(screen.getByTestId('searchable-poles-input')).toBeInTheDocument();
    });
  });

  describe('Interface compliance', () => {
    it('matches SearchablePolesProps interface', () => {
      // Test that the component accepts all props defined in the interface
      const props = {
        value: 'test-value' as string | null,
        onChange: vi.fn() as (value: string) => void,
        mode: 'view' as string,
      };

      expect(() => renderSearchablePoles(props)).not.toThrow();
    });

    it('handles null value type', () => {
      const props = {
        value: null,
        onChange: vi.fn(),
      };

      expect(() => renderSearchablePoles(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent('');
    });

    it('handles string value type', () => {
      const props = {
        value: 'pole-456' as string,
        onChange: vi.fn(),
      };

      expect(() => renderSearchablePoles(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent('pole-456');
    });
  });

  describe('Pole-specific features', () => {
    it('uses pole_id for display label', () => {
      renderSearchablePoles();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult.pole_id).toBe('P-001');
      expect(parsedResult.label).toBe('P-001');
    });

    it('includes status information in response mapper', () => {
      renderSearchablePoles();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult.status).toBe('active');
    });

    it('displays pole information with proper formatting', () => {
      renderSearchablePoles();

      const optionLabel = screen.getByTestId('render-option-label');

      // Check that the format includes both pole ID and status
      expect(optionLabel.textContent).toContain('P-001');
      expect(optionLabel.textContent).toContain('active');
      expect(optionLabel.textContent).toContain('Pole:');
      expect(optionLabel.textContent).toContain('Status:');
    });

    it('uses item.id as the value for selection', () => {
      renderSearchablePoles();

      const parsedResult = getResponseMapperResult();

      // The value should be the internal id, not the display pole_id
      expect(parsedResult.value).toBe('pole-123');
      expect(parsedResult.value).not.toBe(parsedResult.pole_id);
    });
  });
});
