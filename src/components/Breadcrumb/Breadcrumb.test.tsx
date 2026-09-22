import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './Breadcrumb';

// Mock the ChevronRight and MoreHorizontal icons
vi.mock('lucide-react', () => ({
  ChevronRight: () => <div data-testid="chevron-icon">ChevronIcon</div>,
  MoreHorizontal: () => <div data-testid="more-icon">MoreIcon</div>,
}));

// Mock the cn utility
vi.mock('@app/lib/utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}));

// Mock Radix UI Slot
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => (
    <div data-testid="slot" {...props}>
      {children}
    </div>
  ),
}));

import { cn } from '@app/lib/utils';

describe('Breadcrumb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Breadcrumb component', () => {
    render(<Breadcrumb>Breadcrumb Content</Breadcrumb>);

    const breadcrumb = screen.getByRole('navigation');
    expect(breadcrumb).toBeInTheDocument();
    expect(breadcrumb).toHaveAttribute('aria-label', 'breadcrumb');
    expect(breadcrumb).toHaveTextContent('Breadcrumb Content');
  });

  it('should render BreadcrumbList component', () => {
    render(<BreadcrumbList>List Items</BreadcrumbList>);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveTextContent('List Items');
    expect(vi.mocked(cn)).toHaveBeenCalledWith(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
      undefined
    );
  });

  it('should render BreadcrumbItem component', () => {
    render(<BreadcrumbItem>Item Content</BreadcrumbItem>);

    const item = screen.getByRole('listitem');
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent('Item Content');
    expect(vi.mocked(cn)).toHaveBeenCalledWith('inline-flex items-center gap-1.5', undefined);
  });

  it('should render BreadcrumbLink component', () => {
    render(<BreadcrumbLink href="/test">Link Text</BreadcrumbLink>);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Link Text');
    expect(link).toHaveAttribute('href', '/test');
    expect(vi.mocked(cn)).toHaveBeenCalledWith('transition-colors hover:text-foreground', undefined);
  });

  it('should render BreadcrumbLink with asChild prop', () => {
    render(<BreadcrumbLink asChild>Link Text</BreadcrumbLink>);

    const slot = screen.getByTestId('slot');
    expect(slot).toBeInTheDocument();
    expect(slot).toHaveTextContent('Link Text');
  });

  it('should render BreadcrumbPage component', () => {
    render(<BreadcrumbPage>Current Page</BreadcrumbPage>);

    const page = screen.getByText('Current Page');
    expect(page).toBeInTheDocument();
    expect(page.tagName).toBe('SPAN');
    expect(page).toHaveAttribute('aria-current', 'page');
    expect(page).toHaveAttribute('aria-disabled', 'true');
    expect(vi.mocked(cn)).toHaveBeenCalledWith('font-normal text-foreground', undefined);
  });

  it('should render BreadcrumbSeparator with default chevron icon', () => {
    render(<BreadcrumbSeparator />);

    const separator = screen.getByRole('listitem', { hidden: true });
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
    expect(vi.mocked(cn)).toHaveBeenCalledWith('[&>svg]:h-3.5 [&>svg]:w-3.5', undefined);
  });

  it('should render BreadcrumbSeparator with custom children', () => {
    render(<BreadcrumbSeparator>-</BreadcrumbSeparator>);

    const separator = screen.getByRole('listitem', { hidden: true });
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveTextContent('-');
    expect(screen.queryByTestId('chevron-icon')).not.toBeInTheDocument();
  });

  it('should render BreadcrumbEllipsis component', () => {
    render(<BreadcrumbEllipsis />);

    const ellipsis = screen.getByText('More');
    expect(ellipsis).toBeInTheDocument();
    expect(ellipsis.parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('more-icon')).toBeInTheDocument();
    expect(vi.mocked(cn)).toHaveBeenCalledWith('flex h-9 w-9 items-center justify-center', undefined);
  });

  it('should apply custom className to all components', () => {
    render(
      <Breadcrumb className="custom-breadcrumb">
        <BreadcrumbList className="custom-list">
          <BreadcrumbItem className="custom-item">
            <BreadcrumbLink className="custom-link">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="custom-separator" />
          <BreadcrumbItem>
            <BreadcrumbPage className="custom-page">Current</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbEllipsis className="custom-ellipsis" />
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(vi.mocked(cn)).toHaveBeenCalledWith(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
      'custom-list'
    );
    expect(vi.mocked(cn)).toHaveBeenCalledWith('inline-flex items-center gap-1.5', 'custom-item');
    expect(vi.mocked(cn)).toHaveBeenCalledWith('transition-colors hover:text-foreground', 'custom-link');
    expect(vi.mocked(cn)).toHaveBeenCalledWith('[&>svg]:h-3.5 [&>svg]:w-3.5', 'custom-separator');
    expect(vi.mocked(cn)).toHaveBeenCalledWith('font-normal text-foreground', 'custom-page');
    expect(vi.mocked(cn)).toHaveBeenCalledWith('flex h-9 w-9 items-center justify-center', 'custom-ellipsis');
  });

  it('should forward ref correctly for all components', () => {
    const refs = {
      breadcrumb: vi.fn(),
      list: vi.fn(),
      item: vi.fn(),
      link: vi.fn(),
      page: vi.fn(),
    };

    render(
      <Breadcrumb ref={refs.breadcrumb}>
        <BreadcrumbList ref={refs.list}>
          <BreadcrumbItem ref={refs.item}>
            <BreadcrumbLink ref={refs.link}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage ref={refs.page}>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(refs.breadcrumb).toHaveBeenCalled();
    expect(refs.list).toHaveBeenCalled();
    expect(refs.item).toHaveBeenCalled();
    expect(refs.link).toHaveBeenCalled();
    expect(refs.page).toHaveBeenCalled();
  });

  it('should render a complete breadcrumb navigation', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Product Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();

    // Get all list items (including separators with aria-hidden)
    const listItems = screen.getAllByRole('listitem', { hidden: true });
    expect(listItems).toHaveLength(5); // 3 regular items + 2 separators

    // Get links (only actual links, not the BreadcrumbPage span)
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2); // 2 links only

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Product Details')).toBeInTheDocument();
    expect(screen.getAllByTestId('chevron-icon')).toHaveLength(2);
  });
});
