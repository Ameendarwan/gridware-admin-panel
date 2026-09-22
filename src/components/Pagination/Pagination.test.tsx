import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './Pagination';
import { vi } from 'vitest';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock the Lucide icons
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  MoreHorizontal: () => <div data-testid="more-horizontal-icon" />,
}));

// Mock the Button component variants
vi.mock('@app/components/Button/Button', () => ({
  buttonVariants: ({ variant, size }: { variant?: string; size?: string }) => {
    const variantClasses: Record<string, string> = {
      default: 'bg-primary text-primary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'border border-input bg-background',
      secondary: 'bg-secondary text-secondary-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    };

    const sizeClasses: Record<string, string> = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return `${variant && variantClasses[variant] ? variantClasses[variant] : ''} ${size && sizeClasses[size] ? sizeClasses[size] : ''}`;
  },
}));

describe('Pagination', () => {
  it('renders pagination component with custom className', () => {
    render(<Pagination className="custom-class" />);

    const pagination = screen.getByRole('navigation');
    expect(pagination).toBeInTheDocument();
    expect(pagination).toHaveClass('custom-class');
    expect(pagination).toHaveAttribute('aria-label', 'pagination');
  });

  it('renders pagination content with items', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>2</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders active pagination link with correct styling', () => {
    render(<PaginationLink isActive>1</PaginationLink>);

    const link = screen.getByText('1');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('renders pagination previous link with icon', () => {
    render(<PaginationPrevious />);

    expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
  });

  it('renders pagination next link with icon', () => {
    render(<PaginationNext />);

    expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
  });

  it('renders pagination ellipsis', () => {
    render(<PaginationEllipsis />);

    expect(screen.getByTestId('more-horizontal-icon')).toBeInTheDocument();
    expect(screen.getByText('More pages', { selector: '.sr-only' })).toBeInTheDocument();
  });

  it('renders a complete pagination example', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('More pages', { selector: '.sr-only' })).toBeInTheDocument();
    expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
  });
});
