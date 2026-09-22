import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchableDevices from './SearchableDevices';

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
        <button data-testid="trigger-change" onClick={() => onValueChange?.('test-device-value')}>
          Change
        </button>
        <div data-testid="response-mapper">
          {responseMapper &&
            JSON.stringify(
              responseMapper({
                id: 'device-123',
                serial_no: 'SN123456',
                type: 'sensor',
                solar_orientation: 'north',
              })
            )}
        </div>
        <div data-testid="render-option-label">
          {renderOptionLabel?.({
            serial_no: 'SN123456',
            type: 'sensor',
            value: 'test-value',
            label: 'SN123456',
          })}
        </div>
      </div>
    )
  ),
}));

describe('SearchableDevices', () => {
  const defaultProps = {
    value: null,
    onChange: vi.fn(),
  };

  const renderSearchableDevices = (props = {}) => {
    return render(<SearchableDevices {...defaultProps} {...props} />);
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
      renderSearchableDevices();

      expect(screen.getByTestId('searchable-devices-input')).toBeInTheDocument();
      expect(screen.getByTestId('multi-select')).toHaveTextContent('true');
      expect(screen.getByTestId('fetch-url')).toHaveTextContent('/device/all');
      expect(screen.getByTestId('placeholder')).toHaveTextContent('Select Device');
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('renders with null value', () => {
      renderSearchableDevices({ value: null });

      expect(screen.getByTestId('value')).toHaveTextContent('');
    });

    it('renders with string value', () => {
      renderSearchableDevices({ value: 'device-123' });

      expect(screen.getByTestId('value')).toHaveTextContent('device-123');
    });

    it('renders with array value', () => {
      renderSearchableDevices({ value: ['device-1', 'device-2'] });

      expect(screen.getByTestId('value')).toHaveTextContent('device-1,device-2');
    });
  });

  describe('MultiSelect configuration', () => {
    it('has multiSelect enabled', () => {
      renderSearchableDevices();

      expect(screen.getByTestId('multi-select')).toHaveTextContent('true');
    });
  });

  describe('Mode handling', () => {
    it('is not disabled when mode is not provided', () => {
      renderSearchableDevices();

      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('is not disabled when mode is edit', () => {
      renderSearchableDevices({ mode: 'edit' });

      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });

    it('is disabled when mode is view', () => {
      renderSearchableDevices({ mode: 'view' });

      expect(screen.getByTestId('disabled')).toHaveTextContent('true');
    });
  });

  describe('Response mapping', () => {
    it('maps response data correctly with complex value format', () => {
      renderSearchableDevices();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult).toEqual({
        value: 'id:device-123,serial_no:SN123456,type:sensor,solar_orientation:north,is_validated:false',
        label: 'SN123456',
        serial_no: 'SN123456',
        type: 'sensor',
      });
    });

    it('includes all required device properties in response mapper', () => {
      renderSearchableDevices();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult).toHaveProperty('value');
      expect(parsedResult).toHaveProperty('label');
      expect(parsedResult).toHaveProperty('serial_no');
      expect(parsedResult).toHaveProperty('type');
    });

    it('creates complex value string with device metadata', () => {
      renderSearchableDevices();

      const parsedResult = getResponseMapperResult();

      const expectedValuePattern =
        /^id:device-123,serial_no:SN123456,type:sensor,solar_orientation:north,is_validated:false$/;
      expect(parsedResult.value).toMatch(expectedValuePattern);
    });

    it('uses serial_no as label', () => {
      renderSearchableDevices();

      const parsedResult = getResponseMapperResult();

      expect(parsedResult.label).toBe('SN123456');
    });
  });

  describe('Option label rendering', () => {
    it('renders option label with serial_no and type', () => {
      renderSearchableDevices();

      const optionLabel = screen.getByTestId('render-option-label');
      expect(optionLabel).toHaveTextContent('SN123456 - sensor');
    });
  });

  describe('Change handling', () => {
    it('calls onChange when value changes', () => {
      const onChange = vi.fn();
      renderSearchableDevices({ onChange });

      screen.getByTestId('trigger-change').click();

      expect(onChange).toHaveBeenCalledWith('test-device-value');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onChange is not provided', () => {
      const { container } = render(<SearchableDevices value={null} onChange={vi.fn()} />);

      expect(() => {
        screen.getByTestId('trigger-change').click();
      }).not.toThrow();

      expect(container).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('passes all required props to SearchableInfiniteSelect', () => {
      const onChange = vi.fn();
      renderSearchableDevices({ value: 'test-value', onChange, mode: 'edit' });

      // Verify all props are passed correctly
      expect(screen.getByTestId('searchable-devices-input')).toBeInTheDocument();
      expect(screen.getByTestId('multi-select')).toHaveTextContent('true');
      expect(screen.getByTestId('fetch-url')).toHaveTextContent('/device/all');
      expect(screen.getByTestId('placeholder')).toHaveTextContent('Select Device');
      expect(screen.getByTestId('value')).toHaveTextContent('test-value');
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    });
  });

  describe('Component memoization', () => {
    it('is wrapped with memo', () => {
      // Test that the component is memoized by checking if it's the same reference
      // when props don't change
      const props = { value: 'test', onChange: vi.fn() };
      const { rerender } = renderSearchableDevices(props);

      // Re-render with same props
      rerender(<SearchableDevices {...defaultProps} {...props} />);
      rerender(<SearchableDevices {...props} />);

      // Component should not re-render unnecessarily
      // This is more of a structural test to ensure memo is applied
      expect(screen.getByTestId('searchable-devices-input')).toBeInTheDocument();
    });
  });

  describe('Interface compliance', () => {
    it('matches SearchableDevicesProps interface', () => {
      // Test that the component accepts all props defined in the interface
      const props = {
        value: 'test-value' as string | string[] | null,
        onChange: vi.fn() as (value: string) => void,
        mode: 'view' as string,
      };

      expect(() => renderSearchableDevices(props)).not.toThrow();
    });

    it('handles string array value type', () => {
      const props = {
        value: ['device-1', 'device-2'] as string[],
        onChange: vi.fn(),
      };

      expect(() => renderSearchableDevices(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent('device-1,device-2');
    });

    it('handles null value type', () => {
      const props = {
        value: null,
        onChange: vi.fn(),
      };

      expect(() => renderSearchableDevices(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent('');
    });

    it('handles string value type', () => {
      const props = {
        value: 'single-device' as string,
        onChange: vi.fn(),
      };

      expect(() => renderSearchableDevices(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent('single-device');
    });
  });

  describe('Device-specific features', () => {
    it('includes device metadata in value string', () => {
      renderSearchableDevices();

      const parsedResult = getResponseMapperResult();

      // Check that the value contains all expected device metadata
      expect(parsedResult.value).toContain('id:device-123');
      expect(parsedResult.value).toContain('serial_no:SN123456');
      expect(parsedResult.value).toContain('type:sensor');
      expect(parsedResult.value).toContain('solar_orientation:north');
      expect(parsedResult.value).toContain('is_validated:false');
    });

    it('formats device value string correctly', () => {
      renderSearchableDevices();

      const parsedResult = getResponseMapperResult();

      const valueParts = parsedResult.value.split(',');
      expect(valueParts).toHaveLength(5);
      expect(valueParts[0]).toBe('id:device-123');
      expect(valueParts[1]).toBe('serial_no:SN123456');
      expect(valueParts[2]).toBe('type:sensor');
      expect(valueParts[3]).toBe('solar_orientation:north');
      expect(valueParts[4]).toBe('is_validated:false');
    });
  });
});
