import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, badgeVariants } from './Badge';

describe('Badge', () => {
  const renderBadge = (props: React.ComponentProps<typeof Badge>) => {
    render(<Badge {...props}>{props.children}</Badge>);
    return screen.getByText(props.children as string);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default variant', () => {
    const badge = renderBadge({ children: 'Test Badge' });
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-primary');
  });

  it('should render with secondary variant', () => {
    const badge = renderBadge({ variant: 'secondary', children: 'Secondary Badge' });
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-secondary');
  });

  it('should render with destructive variant', () => {
    const badge = renderBadge({ variant: 'destructive', children: 'Destructive Badge' });
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-destructive');
  });

  it('should render with outline variant', () => {
    const badge = renderBadge({ variant: 'outline', children: 'Outline Badge' });
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-foreground');
  });

  it('should render with success variant', () => {
    const badge = renderBadge({ variant: 'success', children: 'Success Badge' });
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-[#169b7b]');
  });

  it('should apply custom className', () => {
    const badge = renderBadge({ className: 'custom-class', children: 'Custom Badge' });
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('custom-class');
  });

  it('should pass additional props to the div element', () => {
    render(
      <Badge data-testid="test-badge" aria-label="Test Badge">
        Badge
      </Badge>
    );

    const badge = screen.getByTestId('test-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', 'Test Badge');
  });

  it('should render as a div element', () => {
    const badge = renderBadge({ children: 'Badge' });
    expect(badge.tagName).toBe('DIV');
  });

  describe('badgeVariants', () => {
    it('should return the correct class names for default variant', () => {
      const result = badgeVariants({ variant: 'default' });
      expect(result).toContain('bg-primary');
      expect(result).toContain('text-primary-foreground');
    });

    it('should return the correct class names for secondary variant', () => {
      const result = badgeVariants({ variant: 'secondary' });
      expect(result).toContain('bg-secondary');
      expect(result).toContain('text-secondary-foreground');
    });

    it('should return the correct class names for destructive variant', () => {
      const result = badgeVariants({ variant: 'destructive' });
      expect(result).toContain('bg-destructive');
      expect(result).toContain('text-destructive-foreground');
    });

    it('should return the correct class names for outline variant', () => {
      const result = badgeVariants({ variant: 'outline' });
      expect(result).toContain('text-foreground');
      expect(result).toContain('max-w-max');
    });

    it('should return the correct class names for success variant', () => {
      const result = badgeVariants({ variant: 'success' });
      expect(result).toContain('bg-[#169b7b]');
      expect(result).toContain('text-white');
    });
  });
});
