import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

// Mock cn utility
vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Skeleton component', () => {
  it('renders with default props', () => {
    render(<Skeleton data-testid="skeleton-test" />);
    
    const skeleton = screen.getByTestId('skeleton-test');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.className).toContain('animate-pulse');
    expect(skeleton.className).toContain('rounded-md');
    expect(skeleton.className).toContain('bg-muted');
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton h-10 w-20" data-testid="skeleton-test" />);
    
    const skeleton = screen.getByTestId('skeleton-test');
    expect(skeleton.className).toContain('custom-skeleton');
    expect(skeleton.className).toContain('h-10');
    expect(skeleton.className).toContain('w-20');
  });

  it('forwards props to div element', () => {
    render(<Skeleton data-testid="skeleton-test" aria-label="Loading" />);
    
    const skeleton = screen.getByTestId('skeleton-test');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders with children', () => {
    render(
      <Skeleton data-testid="skeleton-test">
        <div>Child content</div>
      </Skeleton>
    );
    
    const skeleton = screen.getByTestId('skeleton-test');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveTextContent('Child content');
  });

  it('can be used to create complex loading states', () => {
    render(
      <div data-testid="skeleton-container">
        <Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />
        <div className="space-y-2" data-testid="text-container">
          <Skeleton className="h-4 w-[250px]" data-testid="text-skeleton-1" />
          <Skeleton className="h-4 w-[200px]" data-testid="text-skeleton-2" />
        </div>
      </div>
    );
    
    const container = screen.getByTestId('skeleton-container');
    const skeletons = container.querySelectorAll('div');
    
    // Should have 4 divs: container, avatar skeleton, and 2 text skeletons
    expect(skeletons.length).toBe(4);
    
    // Check avatar skeleton
    const avatarSkeleton = screen.getByTestId('avatar-skeleton');
    expect(avatarSkeleton.className).toContain('rounded-full');
    
    // Check text skeletons
    const textSkeleton1 = screen.getByTestId('text-skeleton-1');
    const textSkeleton2 = screen.getByTestId('text-skeleton-2');
    expect(textSkeleton1.className).toContain('w-[250px]');
    expect(textSkeleton2.className).toContain('w-[200px]');
  });
});
