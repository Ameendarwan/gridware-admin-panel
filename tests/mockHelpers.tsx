import { vi } from 'vitest';
import React from 'react';

/**
 * Shared mock implementations for test files to reduce code duplication
 */

// Command Component Mocks
export const mockCommandComponents = () => {
  vi.mock('@app/components/Command/Command', () => ({
    Command: vi.fn(({ children, className }: any) => (
      <div data-testid="command" className={className}>
        {children}
      </div>
    )),
    CommandEmpty: vi.fn(({ children }: any) => <div data-testid="command-empty">{children}</div>),
    CommandGroup: vi.fn(({ children, className }: any) => (
      <div data-testid="command-group" className={className}>
        {children}
      </div>
    )),
    CommandInput: vi.fn(({ placeholder, className, autoFocus }: any) => (
      <input data-testid="command-input" placeholder={placeholder} className={className} autoFocus={autoFocus} />
    )),
    CommandItem: vi.fn(({ children, onSelect, className }: any) => (
      <button data-testid="command-item" className={className} onClick={onSelect} type="button">
        {children}
      </button>
    )),
    CommandList: vi.fn(({ children }: any) => <div data-testid="command-list">{children}</div>),
    CommandSeparator: vi.fn(() => <hr data-testid="command-separator" />),
  }));
};

// DropdownMenu Component Mocks
export const mockDropdownMenuComponents = () => {
  vi.mock('@app/components/DropdownMenu/DropdownMenu', () => ({
    DropdownMenu: vi.fn(({ children }: any) => <div data-testid="dropdown-menu">{children}</div>),
    DropdownMenuCheckboxItem: vi.fn(({ children, checked, onCheckedChange, onSelect }: any) => (
      <button
        type="button"
        data-testid="dropdown-menu-checkbox-item"
        data-checked={checked}
        onClick={(e: any) => {
          onSelect?.(e);
          onCheckedChange?.(!checked);
        }}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(e);
            onCheckedChange?.(!checked);
          }
        }}>
        {children}
      </button>
    )),
    DropdownMenuContent: vi.fn(({ children, align, className }: any) => (
      <div data-testid="dropdown-menu-content" data-align={align} className={className}>
        {children}
      </div>
    )),
    DropdownMenuLabel: vi.fn(({ children }: any) => <div data-testid="dropdown-menu-label">{children}</div>),
    DropdownMenuSeparator: vi.fn(() => <hr data-testid="dropdown-menu-separator" />),
    DropdownMenuTrigger: vi.fn(({ children, asChild }: any) => (
      <div data-testid="dropdown-menu-trigger" data-as-child={asChild}>
        {children}
      </div>
    )),
  }));
};

// Button Component Mock
export const mockButtonComponent = () => {
  vi.mock('@app/components/Button/Button', () => ({
    Button: vi.fn(({ children, variant, size, className, 'aria-label': ariaLabel, ...props }: any) => (
      <button
        data-testid="view-options-button"
        data-variant={variant}
        data-size={size}
        className={className}
        aria-label={ariaLabel}
        {...props}>
        {children}
      </button>
    )),
  }));
};

// Popover Component Mocks
export const mockPopoverComponents = () => {
  vi.mock('@app/components/Popover/Popover', () => ({
    Popover: ({ open, children }: any) => (
      <div data-testid="popover" data-open={open}>
        {children}
      </div>
    ),
    PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
    PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  }));
};

// Separator Component Mock
export const mockSeparatorComponent = () => {
  vi.mock('@app/components/Separator/Separator', () => ({
    Separator: ({ children, ...props }: any) => (
      <div data-testid="separator" {...props}>
        {children}
      </div>
    ),
  }));
};

// SVGIcon Component Mock
export const mockSVGIconComponent = () => {
  vi.mock('@app/components/SVGIcon', () => ({
    __esModule: true,
    default: ({ icon }: any) => <span data-testid="svg-icon">{icon}</span>,
  }));
};

// Utils Mock
export const mockCnUtil = () => {
  vi.mock('@app/lib/utils', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' '),
  }));
};

// SearchableInfiniteSelect Component Mock Factory
export const createSearchableInfiniteSelectMock = () => {
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
      <div data-testid={dataTestId || 'searchable-infinite-select'}>
        <div data-testid="multi-select">{multiSelect ? 'true' : 'false'}</div>
        <div data-testid="fetch-url">{fetchUrl}</div>
        <div data-testid="placeholder">{placeholder}</div>
        <div data-testid="value">{Array.isArray(value) ? value.join(',') : value}</div>
        <div data-testid="disabled">{disabled ? 'true' : 'false'}</div>
        <button data-testid="trigger-change" onClick={() => onValueChange?.('test-value')}>
          Change
        </button>
        <div data-testid="response-mapper">
          {responseMapper && JSON.stringify(responseMapper({ id: 'test-id', email: 'test@example.com' }))}
        </div>
        <div data-testid="render-option-label">
          {renderOptionLabel?.({ id: 'test-id', email: 'test@example.com', value: 'test', label: 'test' })}
        </div>
      </div>
    )
  );
};
