import React from 'react';
import { vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

/**
 * Common mock implementations for UI components to reduce duplication across test files
 */

// Button mock
export const createButtonMock = () =>
  vi.fn(({ children, onClick, className, variant, size, 'aria-label': ariaLabel, role }: any) => (
    <button
      data-testid={ariaLabel ? `button-${ariaLabel.toLowerCase().replaceAll(/\s+/g, '-')}` : 'button'}
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
      role={role}>
      {children}
    </button>
  ));

// Command component mocks
export const createCommandMocks = () => ({
  Command: vi.fn(({ children }) => <div data-testid="command">{children}</div>),
  CommandEmpty: vi.fn(({ children }) => <div data-testid="command-empty">{children}</div>),
  CommandGroup: vi.fn(({ children }) => <div data-testid="command-group">{children}</div>),
  CommandInput: vi.fn(({ placeholder }) => <input data-testid="command-input" placeholder={placeholder} />),
  CommandItem: vi.fn(({ children, value, onSelect }) => {
    let icon = null;
    let label = null;

    if (Array.isArray(children)) {
      icon = children.find(child => typeof child === 'object' && child.type === 'i');
      label = children.find(child => typeof child === 'string');
    }

    return (
      <button data-testid={`command-item-${value}`} onClick={() => onSelect(value)} type="button">
        {icon && <span data-testid={`icon-${value}`}>{icon}</span>}
        {label || children}
      </button>
    );
  }),
  CommandList: vi.fn(({ children }) => <div data-testid="command-list">{children}</div>),
  CommandSeparator: vi.fn(() => <hr data-testid="command-separator" />),
});

// Popover component mocks
export const createPopoverMocks = () => ({
  Popover: vi.fn(({ children, open, onOpenChange }) => (
    <button data-testid="popover" data-open={open} onClick={() => onOpenChange?.(!open)} type="button">
      {children}
    </button>
  )),
  PopoverContent: vi.fn(({ children, className, align }) => (
    <div data-testid="popover-content" className={className} data-align={align}>
      {children}
    </div>
  )),
  PopoverTrigger: vi.fn(({ children, asChild }) => (
    <div data-testid="popover-trigger" data-as-child={asChild}>
      {children}
    </div>
  )),
});

// DropdownMenu component mocks
export const createDropdownMenuMocks = () => ({
  DropdownMenu: vi.fn(({ children }) => <div data-testid="dropdown-menu">{children}</div>),
  DropdownMenuContent: vi.fn(({ children, align, className }) => (
    <div data-testid="dropdown-menu-content" data-align={align} className={className}>
      {children}
    </div>
  )),
  DropdownMenuItem: vi.fn(({ children, onClick }) => (
    <button
      data-testid={`dropdown-menu-item-${typeof children === 'string' ? children.toLowerCase().replaceAll(/\s+/g, '-') : 'item'}`}
      onClick={onClick}>
      {children}
    </button>
  )),
  DropdownMenuTrigger: vi.fn(({ children, asChild }) => (
    <div data-testid="dropdown-menu-trigger" data-as-child={asChild}>
      {children}
    </div>
  )),
});

// Input mock
export const createInputMock = () =>
  vi.fn(({ placeholder, value, onChange, className }: any) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  ));

// Select component mocks
export const createSelectMocks = () => ({
  Select: vi.fn(({ children, value, onValueChange }: any) => {
    const handleClick = () => {
      onValueChange?.('10');
    };
    return (
      <button data-testid="select" data-value={value} onClick={handleClick} type="button">
        {children}
      </button>
    );
  }),
  SelectContent: vi.fn(({ children, side }: any) => (
    <div data-testid="select-content" data-side={side}>
      {children}
    </div>
  )),
  SelectItem: vi.fn(({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  )),
  SelectTrigger: vi.fn(({ children, className }: any) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  )),
  SelectValue: vi.fn(({ placeholder }: any) => <span data-testid="select-value">Show {placeholder} Rows</span>),
});

// Redux store factory
export const createMockReduxStore = (reducer = {}) => {
  return configureStore({
    reducer: {
      poles: (state = {}) => state,
      ...reducer,
    },
  });
};

// Helper to render components with Redux
export const createReduxRenderer = (store: any) => {
  const Provider = require('react-redux').Provider;
  return (component: React.ReactElement) => {
    return <Provider store={store}>{component}</Provider>;
  };
};

// Confirmation Dialog mock
export const createConfirmationDialogMock = () =>
  vi.fn(({ children, title, description, open, _onOpenChange, onConfirm }: any) => (
    <button data-testid="confirmation-dialog" data-open={open} data-title={title} onClick={() => onConfirm?.()}>
      {description}
      {children}
    </button>
  ));
