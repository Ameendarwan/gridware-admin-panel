import { vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

/**
 * Shared factory for creating SearchableInfiniteSelect mocks
 *
 * NOTE: Due to vitest's hoisting behavior, this factory CANNOT be used directly inside vi.mock() calls.
 * Vitest hoists vi.mock() to the top of the file before any imports execute, so imported functions
 * are not available at that time.
 *
 * This file serves as:
 * 1. Documentation of the common mock pattern
 * 2. Reference implementation for SearchableDevices, SearchableUsers, SearchablePoles, etc.
 * 3. Shared test helper functions that can be used OUTSIDE of vi.mock()
 *
 * To use this pattern, copy the mock implementation directly into your test file's vi.mock() call.
 */

interface SearchableMockConfig {
  testId?: string;
  testData: any;
  triggerValue?: string;
  renderLabel?: (data: any) => React.ReactNode;
}

/**
 * REFERENCE IMPLEMENTATION - Copy this into vi.mock() calls
 * Cannot be imported due to vitest hoisting
 */
export const createSearchableInfiniteSelectMock = (config: SearchableMockConfig) => {
  const { testId = 'searchable-infinite-select', testData, triggerValue = 'test-value', renderLabel } = config;

  return vi.fn(
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
    }: any) => (
      <div data-testid={dataTestId || testId}>
        <div data-testid="multi-select">{multiSelect ? 'true' : 'false'}</div>
        <div data-testid="fetch-url">{fetchUrl}</div>
        <div data-testid="placeholder">{placeholder}</div>
        <div data-testid="value">{Array.isArray(value) ? value.join(',') : value}</div>
        <div data-testid="disabled">{disabled ? 'true' : 'false'}</div>
        <button data-testid="trigger-change" onClick={() => onValueChange?.(triggerValue)}>
          Change
        </button>
        <div data-testid="response-mapper">{responseMapper && JSON.stringify(responseMapper(testData))}</div>
        <div data-testid="render-option-label">
          {renderLabel ? renderLabel(testData) : renderOptionLabel?.(testData)}
        </div>
      </div>
    )
  );
};

// Helper to get parsed response mapper result - CAN be used in tests
export const getResponseMapperResult = (screen: any) => {
  const responseMapperText = screen.getByTestId('response-mapper').textContent;
  return JSON.parse(responseMapperText ?? '{}');
};

// Common test helpers for searchable components - CAN be used in tests
export const createSearchableTestHelpers = (defaultProps: any) => {
  const renderComponent =
    (Component: React.ComponentType<any>) =>
    (props = {}) => {
      return render(<Component {...defaultProps} {...props} />);
    };

  const testBasicRendering = (screen: any, expectedUrl: string, expectedPlaceholder: string, testId: string) => {
    expect(screen.getByTestId(testId)).toBeInTheDocument();
    expect(screen.getByTestId('fetch-url')).toHaveTextContent(expectedUrl);
    expect(screen.getByTestId('placeholder')).toHaveTextContent(expectedPlaceholder);
    expect(screen.getByTestId('disabled')).toHaveTextContent('false');
  };

  const testValueStates = (renderFn: any, screen: any) => {
    // Test null value
    renderFn({ value: null });
    expect(screen.getByTestId('value')).toHaveTextContent('');

    // Test string value
    renderFn({ value: 'test-123' });
    expect(screen.getByTestId('value')).toHaveTextContent('test-123');

    // Test array value
    renderFn({ value: ['item-1', 'item-2'] });
    expect(screen.getByTestId('value')).toHaveTextContent('item-1,item-2');
  };

  const testModeHandling = (renderFn: any, screen: any) => {
    // Not disabled when mode is not provided
    renderFn();
    expect(screen.getByTestId('disabled')).toHaveTextContent('false');

    // Not disabled when mode is edit
    renderFn({ mode: 'edit' });
    expect(screen.getByTestId('disabled')).toHaveTextContent('false');

    // Disabled when mode is view
    renderFn({ mode: 'view' });
    expect(screen.getByTestId('disabled')).toHaveTextContent('true');
  };

  const testOnChange = (renderFn: any, screen: any, expectedValue: string) => {
    const onChange = vi.fn();
    renderFn({ onChange });
    screen.getByTestId('trigger-change').click();
    expect(onChange).toHaveBeenCalledWith(expectedValue);
    expect(onChange).toHaveBeenCalledTimes(1);
  };

  return {
    renderComponent,
    testBasicRendering,
    testValueStates,
    testModeHandling,
    testOnChange,
  };
};
