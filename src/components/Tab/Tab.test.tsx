import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tab from './Tab';
import { Validation } from '@app/pages/Deployments/components/SideFilters/types';

// Mock SVGIcon component
vi.mock('../SVGIcon', () => ({
  default: vi.fn(({ icon, height, width, color }) => (
    <div 
      data-testid={`${icon}-icon`}
      data-height={height}
      data-width={width}
      className={color}
    />
  )),
}));

describe('Tab component', () => {
  // Create a properly typed mockItem that satisfies the Validation interface
  const mockItem: Validation = {
    step: 1,
    icon: 'pole' as const, // Using string literal with const assertion
    tabTitle: 'Test Tab',
    activeColor: 'blue',
    stepTitle: 'Step 1',
    // Optional properties
    isCompleted: false
  };
  
  const mockHandleSelect = vi.fn();

  beforeEach(() => {
    mockHandleSelect.mockClear();
  });

  it('renders active tab correctly', () => {
    render(
      <Tab 
        item={mockItem} 
        isActive={true} 
        handleSelect={mockHandleSelect} 
      />
    );
    
    const tab = screen.getByText('Test Tab');
    expect(tab).toBeInTheDocument();
    expect(tab.parentElement?.parentElement).toHaveClass('border-primary');
  });

  it('renders inactive tab correctly', () => {
    render(
      <Tab 
        item={mockItem} 
        isActive={false} 
        handleSelect={mockHandleSelect} 
      />
    );
    
    const tab = screen.getByText('Test Tab');
    expect(tab).toBeInTheDocument();
    expect(tab.parentElement?.parentElement).toHaveClass('border-transparent');
  });

  it('renders completed tab with check icon', () => {
    render(
      <Tab 
        item={mockItem} 
        isActive={false} 
        isCompleted={true} 
        handleSelect={mockHandleSelect} 
      />
    );
    
    const tab = screen.getByText('Test Tab');
    expect(tab).toHaveClass('text-success');
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('renders pending tab with correct styling', () => {
    render(
      <Tab 
        item={mockItem} 
        isActive={false} 
        isPending={true} 
        handleSelect={mockHandleSelect} 
      />
    );
    
    const tab = screen.getByText('Test Tab');
    expect(tab).toHaveClass('text-[#C9C7C7]');
  });

  it('renders disabled tab with correct styling', () => {
    render(
      <Tab 
        item={mockItem} 
        isActive={false} 
        isDisabled={true} 
        handleSelect={mockHandleSelect} 
      />
    );
    
    const tab = screen.getByText('Test Tab').parentElement?.parentElement;
    expect(tab).toHaveClass('!cursor-not-allowed');
  });

  it('calls handleSelect when tab is clicked', () => {
    render(
      <Tab 
        item={mockItem} 
        isActive={false} 
        handleSelect={mockHandleSelect} 
      />
    );
    
    const tab = screen.getByText('Test Tab').parentElement?.parentElement;
    fireEvent.click(tab!);
    
    expect(mockHandleSelect).toHaveBeenCalledWith(mockItem);
  });

  it('does not call handleSelect when disabled tab is clicked', () => {
    render(
      <Tab 
        item={mockItem} 
        isActive={false} 
        isDisabled={true} 
        handleSelect={mockHandleSelect} 
      />
    );
    
    const tab = screen.getByText('Test Tab').parentElement?.parentElement;
    fireEvent.click(tab!);
    
    expect(mockHandleSelect).not.toHaveBeenCalled();
  });
});
