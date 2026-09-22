import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarRadioGroup,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarSub,
  MenubarSeparator,
  MenubarLabel,
  MenubarShortcut
} from './Menubar';
import { vi } from 'vitest';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock the Lucide icons
vi.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
}));

// Mock the Radix UI Menubar components
vi.mock('@radix-ui/react-menubar', () => {
  // Keep track of menubar state
  let menubarState = 'closed';
  
  return {
    Root: ({ children, className, ...props }: any) => (
      <div data-testid="menubar-root" className={className} {...props}>
        {children}
      </div>
    ),
    Menu: ({ children }: any) => (
      <div data-testid="menubar-menu">{children}</div>
    ),
    Trigger: ({ children, className, ...props }: any) => (
      <button 
        data-testid="menubar-trigger" 
        className={className} 
        onClick={() => { menubarState = 'open'; }}
        data-state={menubarState}
        {...props}
      >
        {children}
      </button>
    ),
    Portal: ({ children }: any) => (
      <div data-testid="menubar-portal">{children}</div>
    ),
    Content: ({ children, className, ...props }: any) => (
      <div data-testid="menubar-content" className={className} {...props}>
        {children}
      </div>
    ),
    Item: ({ children, className, ...props }: any) => (
      <div data-testid="menubar-item" className={className} {...props}>
        {children}
      </div>
    ),
    CheckboxItem: ({ children, className, checked, ...props }: any) => (
      <div data-testid="menubar-checkbox-item" className={className} data-state={checked ? 'checked' : 'unchecked'} {...props}>
        {children}
      </div>
    ),
    RadioItem: ({ children, className, value, ...props }: any) => (
      <div data-testid="menubar-radio-item" className={className} value={value} {...props}>
        {children}
      </div>
    ),
    Label: ({ children, className, ...props }: any) => (
      <div data-testid="menubar-label" className={className} {...props}>
        {children}
      </div>
    ),
    Separator: ({ className, ...props }: any) => (
      <div data-testid="menubar-separator" className={className} {...props} />
    ),
    Sub: ({ children }: any) => (
      <div data-testid="menubar-sub">{children}</div>
    ),
    SubTrigger: ({ children, className, inset, ...props }: any) => (
      <div data-testid="menubar-sub-trigger" className={className} data-inset={inset ? '' : undefined} {...props}>
        {children}
      </div>
    ),
    SubContent: ({ children, className, ...props }: any) => (
      <div data-testid="menubar-sub-content" className={className} {...props}>
        {children}
      </div>
    ),
    RadioGroup: ({ children, ...props }: any) => (
      <div data-testid="menubar-radio-group" {...props}>{children}</div>
    ),
    Group: ({ children, ...props }: any) => (
      <div data-testid="menubar-group" {...props}>{children}</div>
    ),
    // Add the missing ItemIndicator component
    ItemIndicator: ({ children, className, ...props }: any) => (
      <div data-testid="menubar-item-indicator" className={className} {...props}>
        {children}
      </div>
    ),
  };
});

describe('Menubar', () => {
  it('should render Menubar with all its parts', async () => {
    const user = userEvent.setup();
    
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New Tab</MenubarItem>
            <MenubarItem>New Window</MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Share</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Email</MenubarItem>
                <MenubarItem>Messages</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarCheckboxItem checked>Show Toolbar</MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarLabel>View</MenubarLabel>
            <MenubarRadioGroup value="medium">
              <MenubarRadioItem value="small">Small</MenubarRadioItem>
              <MenubarRadioItem value="medium">Medium</MenubarRadioItem>
              <MenubarRadioItem value="large">Large</MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarItem>
              Print <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    
    // Check if the menubar root and trigger are rendered
    expect(screen.getByTestId('menubar-root')).toBeInTheDocument();
    expect(screen.getByTestId('menubar-trigger')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
    
    // Click the trigger to open the menubar
    await user.click(screen.getByTestId('menubar-trigger'));
    
    // Check if all parts are rendered
    expect(screen.getByTestId('menubar-content')).toBeInTheDocument();
    expect(screen.getByText('New Tab')).toBeInTheDocument();
    expect(screen.getByText('New Window')).toBeInTheDocument();
    // Use getAllByTestId for elements that might appear multiple times
    expect(screen.getAllByTestId('menubar-separator').length).toBeGreaterThan(0);
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Show Toolbar')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Small')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Large')).toBeInTheDocument();
    expect(screen.getByText('Print')).toBeInTheDocument();
    expect(screen.getByText('⌘P')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(
      <Menubar className="custom-class">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    );
    
    const menubar = screen.getByTestId('menubar-root');
    expect(menubar).toHaveClass('custom-class');
  });

  it('should render MenubarCheckboxItem with checked state', () => {
    render(
      <MenubarCheckboxItem checked>Show Toolbar</MenubarCheckboxItem>
    );
    
    const checkboxItem = screen.getByTestId('menubar-checkbox-item');
    expect(checkboxItem).toHaveAttribute('data-state', 'checked');
  });

  it('should render MenubarRadioGroup with selected value', () => {
    render(
      <MenubarRadioGroup value="medium">
        <MenubarRadioItem value="small">Small</MenubarRadioItem>
        <MenubarRadioItem value="medium">Medium</MenubarRadioItem>
        <MenubarRadioItem value="large">Large</MenubarRadioItem>
      </MenubarRadioGroup>
    );
    
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('should render MenubarSubTrigger with inset attribute', () => {
    render(
      <MenubarSubTrigger inset>Share</MenubarSubTrigger>
    );
    
    const subTrigger = screen.getByTestId('menubar-sub-trigger');
    // Check for the className containing inset instead of the attribute
    expect(subTrigger.className).toContain('pl-8');
  });
});
