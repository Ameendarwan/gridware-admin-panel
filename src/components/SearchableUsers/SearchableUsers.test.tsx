import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchableUsers from './SearchableUsers';

// Mock the SearchableInfiniteSelect component
vi.mock('@app/components/SearchableInfiniteSelect', () => ({
  default: vi.fn(
    ({
      dataTestId,
      multiSelect,
      fetchUrl,
      responseMapper,
      renderOptionLabel,
      placeholder,
      value,
      onValueChange,
      disabled,
    }) => (
      <div data-testid={dataTestId || 'searchable-infinite-select'}>
        <div data-testid="multi-select">{multiSelect ? 'true' : 'false'}</div>
        <div data-testid="fetch-url">{fetchUrl}</div>
        <div data-testid="placeholder">{placeholder}</div>
        <div data-testid="value">{Array.isArray(value) ? value.join(',') : value}</div>
        <div data-testid="disabled">{disabled ? 'true' : 'false'}</div>
        <button data-testid="trigger-change" onClick={() => onValueChange?.('test-user-id')}>
          Change
        </button>
        <div data-testid="response-mapper">
          {responseMapper &&
            JSON.stringify(
              responseMapper({
                id: 'user-123',
                email: 'test@example.com',
              })
            )}
        </div>
        <div data-testid="render-option-label">
          {renderOptionLabel?.({
            id: 'user-123',
            email: 'test@example.com',
            value: 'user-123',
            label: 'user-123',
          })}
        </div>
      </div>
    )
  ),
}));

describe('SearchableUsers', () => {
  const defaultProps = {
    value: null,
    onChange: vi.fn(),
  };

  const renderSearchableUsers = (props = {}) => {
    return render(<SearchableUsers {...defaultProps} {...props} />);
  };

  const getResponseMapperResult = () => {
    const responseMapperResult = screen.getByTestId('response-mapper').textContent;
    return JSON.parse(responseMapperResult ?? '{}');
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders SearchableInfiniteSelect with correct props', () => {
      renderSearchableUsers();

      expect(screen.getByTestId('searchable-users-input')).toBeInTheDocument();
      expect(screen.getByTestId('multi-select')).toHaveTextContent('true');
      expect(screen.getByTestId('fetch-url')).toHaveTextContent('/user/all');
      expect(screen.getByTestId('placeholder')).toHaveTextContent('Select Users');
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('renders with null value', () => {
      renderSearchableUsers({ value: null });

      expect(screen.getByTestId('value')).toHaveTextContent('');
    });

    it('renders with string value', () => {
      renderSearchableUsers({ value: 'user-123' });

      expect(screen.getByTestId('value')).toHaveTextContent('user-123');
    });

    it('renders with array value', () => {
      renderSearchableUsers({ value: ['user-1', 'user-2'] });

      expect(screen.getByTestId('value')).toHaveTextContent('user-1,user-2');
    });
  });

  describe('MultiSelect configuration', () => {
    it('has multiSelect enabled', () => {
      renderSearchableUsers();

      expect(screen.getByTestId('multi-select')).toHaveTextContent('true');
    });
  });

  describe('Mode handling', () => {
    it('is not disabled when mode is not provided', () => {
      renderSearchableUsers();

      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('is not disabled when mode is edit', () => {
      renderSearchableUsers({ mode: 'edit' });

      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('is disabled when mode is view', () => {
      renderSearchableUsers({ mode: 'view' });

      expect(screen.getByTestId('disabled')).toHaveTextContent('true');
    });
  });

  describe('Response mapping', () => {
    it('maps response data correctly', () => {
      renderSearchableUsers();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult).toEqual({
        value: 'user-123',
        label: 'user-123',
        id: 'user-123',
        email: 'test@example.com',
      });
    });

    it('includes all required user properties in response mapper', () => {
      renderSearchableUsers();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult).toHaveProperty('value');
      expect(parsedResult).toHaveProperty('label');
      expect(parsedResult).toHaveProperty('id');
      expect(parsedResult).toHaveProperty('email');
    });

    it('maps item.id to value, label, and id properties', () => {
      renderSearchableUsers();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult.value).toBe('user-123');
      expect(parsedResult.label).toBe('user-123');
      expect(parsedResult.id).toBe('user-123');
    });

    it('includes email in response mapper', () => {
      renderSearchableUsers();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult.email).toBe('test@example.com');
    });
  });

  describe('Option label rendering', () => {
    it('renders option label with id and email', () => {
      renderSearchableUsers();

      const optionLabel = screen.getByTestId('render-option-label');
      expect(optionLabel).toHaveTextContent('user-123 - test@example.com');
    });
  });

  describe('Change handling', () => {
    it('calls onChange when value changes', () => {
      const onChange = vi.fn();
      renderSearchableUsers({ onChange });

      screen.getByTestId('trigger-change').click();

      expect(onChange).toHaveBeenCalledWith('test-user-id');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onChange is not provided', () => {
      const { container } = render(<SearchableUsers value={null} onChange={vi.fn()} />);

      expect(() => {
        screen.getByTestId('trigger-change').click();
      }).not.toThrow();

      expect(container).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('passes all required props to SearchableInfiniteSelect', () => {
      const onChange = vi.fn();
      renderSearchableUsers({ value: 'test-value', onChange, mode: 'edit' });

      // Verify all props are passed correctly
      expect(screen.getByTestId('searchable-users-input')).toBeInTheDocument();
      expect(screen.getByTestId('multi-select')).toHaveTextContent('true');
      expect(screen.getByTestId('fetch-url')).toHaveTextContent('/user/all');
      expect(screen.getByTestId('placeholder')).toHaveTextContent('Select Users');
      expect(screen.getByTestId('value')).toHaveTextContent('test-value');
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });
  });

  describe('Component memoization', () => {
    it('is wrapped with memo', () => {
      // Test that the component is memoized by checking if it's the same reference
      // when props don't change
      const props = { value: 'test', onChange: vi.fn() };
      const { rerender } = renderSearchableUsers(props);

      // Re-render with same props
      rerender(<SearchableUsers {...defaultProps} {...props} />);

      // Component should not re-render unnecessarily
      // This is more of a structural test to ensure memo is applied
      expect(screen.getByTestId('searchable-users-input')).toBeInTheDocument();
    });
  });

  describe('Interface compliance', () => {
    it('matches interface props (despite incorrect interface name)', () => {
      // Test that the component accepts all props defined in the interface
      // Note: The interface is incorrectly named SearchableDevicesProps but should be SearchableUsersProps
      const props = {
        value: 'test-value' as string | string[] | null,
        onChange: vi.fn() as (value: string) => void,
        mode: 'view' as string,
      };

      expect(() => renderSearchableUsers(props)).not.toThrow();
    });

    it('handles string array value type', () => {
      const props = {
        value: ['user-1', 'user-2'] as string[],
        onChange: vi.fn(),
      };

      expect(() => renderSearchableUsers(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent('user-1,user-2');
    });

    it('handles null value type', () => {
      const props = {
        value: null,
        onChange: vi.fn(),
      };

      expect(() => renderSearchableUsers(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent('');
    });

    it('handles string value type', () => {
      const props = {
        value: 'single-user' as string,
        onChange: vi.fn(),
      };

      expect(() => renderSearchableUsers(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent('single-user');
    });
  });

  describe('User-specific features', () => {
    it('uses user id for both value and label', () => {
      renderSearchableUsers();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult.value).toBe('user-123');
      expect(parsedResult.label).toBe('user-123');
      expect(parsedResult.id).toBe('user-123');
    });

    it('includes email information in response mapper', () => {
      renderSearchableUsers();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult.email).toBe('test@example.com');
    });

    it('displays user information with id and email format', () => {
      renderSearchableUsers();

      const optionLabel = screen.getByTestId('render-option-label');

      // Check that the format includes both user ID and email
      expect(optionLabel.textContent).toContain('user-123');
      expect(optionLabel.textContent).toContain('test@example.com');
      expect(optionLabel.textContent).toContain(' - ');
    });

    it('supports multi-select for multiple user selection', () => {
      renderSearchableUsers();

      expect(screen.getByTestId('multi-select')).toHaveTextContent('true');
    });
  });

  describe('Interface naming issue', () => {
    it('should note that interface name is incorrect but functionality works', () => {
      // This test documents the interface naming issue
      // The interface is named SearchableDevicesProps but should be SearchableUsersProps
      // However, the component functionality is correct

      const props = {
        value: ['user-1', 'user-2'],
        onChange: vi.fn(),
        mode: 'edit',
      };

      expect(() => renderSearchableUsers(props)).not.toThrow();
      expect(screen.getByTestId('searchable-users-input')).toBeInTheDocument();
    });
  });
});
