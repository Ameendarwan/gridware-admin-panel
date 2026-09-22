import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollArea, ScrollBar } from './ScrollArea';

// Mock the Radix UI ScrollArea primitives
vi.mock('@radix-ui/react-scroll-area', () => {
  return {
    Root: ({ className, children, ...props }: any) => (
      <div data-testid="scroll-area-root" className={className} {...props}>
        {children}
      </div>
    ),
    Viewport: ({ className, children, ...props }: any) => (
      <div data-testid="scroll-area-viewport" className={className} {...props}>
        {children}
      </div>
    ),
    ScrollAreaScrollbar: ({ className, orientation, children, ...props }: any) => (
      <div data-testid="scroll-area-scrollbar" data-orientation={orientation} className={className} {...props}>
        {children}
      </div>
    ),
    ScrollAreaThumb: ({ className, ...props }: any) => (
      <div data-testid="scroll-area-thumb" className={className} {...props} />
    ),
    Corner: () => <div data-testid="scroll-area-corner" />,
  };
});

// Mock cn utility
vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('ScrollArea components', () => {
  describe('ScrollArea', () => {
    it('renders with default props', () => {
      render(<ScrollArea>Content</ScrollArea>);

      const root = screen.getByTestId('scroll-area-root');
      const viewport = screen.getByTestId('scroll-area-viewport');
      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      const corner = screen.getByTestId('scroll-area-corner');

      expect(root).toBeInTheDocument();
      expect(viewport).toBeInTheDocument();
      expect(scrollbar).toBeInTheDocument();
      expect(corner).toBeInTheDocument();
      expect(viewport).toHaveTextContent('Content');
    });

    it('applies custom className to root', () => {
      render(<ScrollArea className="custom-scroll-area">Content</ScrollArea>);

      const root = screen.getByTestId('scroll-area-root');
      expect(root.className).toContain('custom-scroll-area');
    });

    it('forwards ref and props to root component', () => {
      render(<ScrollArea data-custom="test-value">Content</ScrollArea>);

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveAttribute('data-custom', 'test-value');
    });
  });

  describe('ScrollBar', () => {
    it('renders with vertical orientation by default', () => {
      render(<ScrollBar />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
      expect(scrollbar.className).toContain('h-full');
    });

    it('renders with horizontal orientation when specified', () => {
      render(<ScrollBar orientation="horizontal" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toHaveAttribute('data-orientation', 'horizontal');
      expect(scrollbar.className).toContain('h-2.5');
    });

    it('applies custom className', () => {
      render(<ScrollBar className="custom-scrollbar" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar.className).toContain('custom-scrollbar');
    });

    it('renders thumb component', () => {
      render(<ScrollBar />);

      const thumb = screen.getByTestId('scroll-area-thumb');
      expect(thumb).toBeInTheDocument();
      expect(thumb.className).toContain('bg-primary');
    });
  });
});
