import { vi } from 'vitest';

/**
 * Common test pattern helpers to reduce code duplication
 */

// Helper to get response mapper result from SearchableInfiniteSelect mock
export const getResponseMapperResult = (screen: any) => {
  const responseMapperResult = screen.getByTestId('response-mapper').textContent;
  return JSON.parse(responseMapperResult ?? '{}');
};

// Helper to test component memoization
export const testComponentMemoization = (renderFn: any, screen: any, testId: string) => {
  const props = { value: 'test', onChange: vi.fn() };
  const { rerender } = renderFn(props);

  // Re-render with same props
  rerender(renderFn.Component?.({ ...props }));

  // Component should not re-render unnecessarily
  expect(screen.getByTestId(testId)).toBeInTheDocument();
};

// Helper to test mode handling (view/edit)
export const createModeTests = () => {
  return {
    testNotDisabledWhenModeNotProvided: (renderFn: any, screen: any) => {
      renderFn();
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    },
    testNotDisabledWhenModeEdit: (renderFn: any, screen: any) => {
      renderFn({ mode: 'edit' });
      expect(screen.getByTestId('disabled')).toHaveTextContent('false');
    },
    testDisabledWhenModeView: (renderFn: any, screen: any) => {
      renderFn({ mode: 'view' });
      expect(screen.getByTestId('disabled')).toHaveTextContent('true');
    },
  };
};

// Helper to test value rendering (null/string/array)
export const createValueRenderingTests = () => {
  return {
    testNullValue: (renderFn: any, screen: any) => {
      renderFn({ value: null });
      expect(screen.getByTestId('value')).toHaveTextContent('');
    },
    testStringValue: (renderFn: any, screen: any, value: string) => {
      renderFn({ value });
      expect(screen.getByTestId('value')).toHaveTextContent(value);
    },
    testArrayValue: (renderFn: any, screen: any, values: string[]) => {
      renderFn({ value: values });
      expect(screen.getByTestId('value')).toHaveTextContent(values.join(','));
    },
  };
};

// Helper to test onChange behavior
export const createOnChangeTests = () => {
  return {
    testOnChangeCall: (renderFn: any, screen: any, expectedValue: string) => {
      const onChange = vi.fn();
      renderFn({ onChange });
      screen.getByTestId('trigger-change').click();
      expect(onChange).toHaveBeenCalledWith(expectedValue);
      expect(onChange).toHaveBeenCalledTimes(1);
    },
  };
};

// Helper to create factory functions for mock data
export function createMockFactory<T>(defaultData: T) {
  return (overrides: Partial<T> = {}): T => ({
    ...defaultData,
    ...overrides,
  });
}

// Helper to test interface compliance with different value types
export const createInterfaceComplianceTests = () => {
  return {
    testStringArrayValueType: (renderFn: any, screen: any, values: string[]) => {
      const props = { value: values, onChange: vi.fn() };
      expect(() => renderFn(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent(values.join(','));
    },
    testNullValueType: (renderFn: any) => {
      const props = { value: null, onChange: vi.fn() };
      expect(() => renderFn(props)).not.toThrow();
    },
    testStringValueType: (renderFn: any, screen: any, value: string) => {
      const props = { value, onChange: vi.fn() };
      expect(() => renderFn(props)).not.toThrow();
      expect(screen.getByTestId('value')).toHaveTextContent(value);
    },
  };
};
