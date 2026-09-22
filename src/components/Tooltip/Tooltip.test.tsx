import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './Tooltip';

// Mock cn utility
vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Mock Radix UI Tooltip primitives
vi.mock('@radix-ui/react-tooltip', () => {
  const React = require('react');
  
  return {
    Provider: ({ children, ...props }: React.PropsWithChildren<any>) => (
      <div data-testid="tooltip-provider" {...props}>
        {children}
      </div>
    ),
    Root: ({ children, open, defaultOpen, onOpenChange, ...props }: React.PropsWithChildren<any>) => (
      <div 
        data-testid="tooltip-root" 
        data-open={open ? '' : undefined}
        data-default-open={defaultOpen ? '' : undefined}
        data-on-open-change={onOpenChange ? 'function' : undefined}
        {...props}
      >
        {children}
      </div>
    ),
    Trigger: React.forwardRef(({ children, asChild, disabled, ...props }: React.PropsWithChildren<any>, ref: any) => (
      <button 
        data-testid="tooltip-trigger" 
        data-as-child={asChild ? '' : undefined}
        disabled={disabled}
        ref={ref} 
        {...props}
      >
        {children}
      </button>
    )),
    Content: React.forwardRef(({ children, className, sideOffset, ...props }: React.PropsWithChildren<any>, ref: any) => (
      <div 
        data-testid="tooltip-content" 
        className={className} 
        data-side-offset={sideOffset}
        ref={ref} 
        {...props}
      >
        {children}
      </div>
    )),
    Arrow: ({ className, ...props }: any) => (
      <div data-testid="tooltip-arrow" className={className} {...props} />
    ),
  };
});

describe('Tooltip components', () => {
  describe('TooltipProvider', () => {
    it('renders with children', () => {
      render(
        <TooltipProvider>
          <div>Provider content</div>
        </TooltipProvider>
      );
      
      const provider = screen.getByTestId('tooltip-provider');
      expect(provider).toBeInTheDocument();
      expect(provider).toHaveTextContent('Provider content');
    });
  });

  describe('Tooltip', () => {
    it('renders with children', () => {
      render(
        <Tooltip>
          <div>Tooltip content</div>
        </Tooltip>
      );
      
      const tooltip = screen.getByTestId('tooltip-root');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Tooltip content');
    });

    it('forwards props to underlying component', () => {
      render(
        <Tooltip open defaultOpen onOpenChange={() => {}}>
          <div>Tooltip content</div>
        </Tooltip>
      );
      
      const tooltip = screen.getByTestId('tooltip-root');
      expect(tooltip).toHaveAttribute('data-open', '');
      expect(tooltip).toHaveAttribute('data-default-open', '');
    });
  });

  describe('TooltipTrigger', () => {
    it('renders with children', () => {
      render(
        <TooltipTrigger>
          Trigger text
        </TooltipTrigger>
      );
      
      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Trigger text');
    });

    it('forwards props to underlying component', () => {
      render(
        <TooltipTrigger asChild disabled>
          Trigger text
        </TooltipTrigger>
      );
      
      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toHaveAttribute('data-as-child', '');
      expect(trigger).toHaveAttribute('disabled', '');
    });
  });

  describe('TooltipContent', () => {
    it('renders with default props', () => {
      render(
        <TooltipContent>
          Content text
        </TooltipContent>
      );
      
      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
      expect(content.className).toContain('z-50');
      expect(content.className).toContain('overflow-hidden');
      expect(content.className).toContain('rounded-md');
      expect(content.className).toContain('bg-popover');
      expect(content.className).toContain('px-3');
      expect(content.className).toContain('py-1.5');
      expect(content.className).toContain('text-sm');
      expect(content.className).toContain('text-popover-foreground');
      expect(content.className).toContain('shadow-md');
      expect(content).toHaveTextContent('Content text');
      expect(content).toHaveAttribute('data-side-offset', '4');
      
      const arrow = screen.getByTestId('tooltip-arrow');
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveClass('fill-primary');
      expect(arrow).toHaveClass('text-popover');
    });

    it('applies custom className', () => {
      render(
        <TooltipContent className="custom-content">
          Content text
        </TooltipContent>
      );
      
      const content = screen.getByTestId('tooltip-content');
      expect(content.className).toContain('custom-content');
    });

    it('accepts custom sideOffset', () => {
      render(
        <TooltipContent sideOffset={8}>
          Content text
        </TooltipContent>
      );
      
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('data-side-offset', '8');
    });

    it('forwards props to underlying component', () => {
      render(
        <TooltipContent side="top" align="center">
          Content text
        </TooltipContent>
      );
      
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('side', 'top');
      expect(content).toHaveAttribute('align', 'center');
    });
  });

  it('renders a complete tooltip example', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>
            Tooltip information
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    
    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-root')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-trigger')).toHaveTextContent('Hover me');
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent('Tooltip information');
    expect(screen.getByTestId('tooltip-arrow')).toBeInTheDocument();
  });
});
