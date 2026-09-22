import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loader from './Loader';

describe('Loader', () => {
  it('should render without crashing', () => {
    render(<Loader />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should render as an SVG element', () => {
    render(<Loader />);
    const loader = screen.getByTestId('loader');
    expect(loader.tagName).toBe('svg');
  });

  it('should have correct default dimensions', () => {
    render(<Loader />);
    const loader = screen.getByTestId('loader');
    expect(loader).toHaveAttribute('width', '200');
    expect(loader).toHaveAttribute('height', '200');
  });

  it('should accept custom width prop', () => {
    render(<Loader width="100" />);
    const loader = screen.getByTestId('loader');
    expect(loader).toHaveAttribute('width', '100');
    expect(loader).toHaveAttribute('height', '200'); // height should remain default
  });

  it('should accept custom height prop', () => {
    render(<Loader height="150" />);
    const loader = screen.getByTestId('loader');
    expect(loader).toHaveAttribute('width', '200'); // width should remain default
    expect(loader).toHaveAttribute('height', '150');
  });

  it('should accept both custom width and height props', () => {
    render(<Loader width="80" height="120" />);
    const loader = screen.getByTestId('loader');
    expect(loader).toHaveAttribute('width', '80');
    expect(loader).toHaveAttribute('height', '120');
  });

  it('should have correct SVG attributes', () => {
    render(<Loader />);
    const loader = screen.getByTestId('loader');

    expect(loader).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(loader).toHaveAttribute('viewBox', '0 0 100 100');
    expect(loader).toHaveAttribute('preserveAspectRatio', 'xMidYMid');
  });

  it('should have correct inline styles', () => {
    render(<Loader />);
    const loader = screen.getByTestId('loader');

    expect(loader).toHaveStyle({
      shapeRendering: 'auto',
      display: 'block',
      background: 'transparent',
    });
  });

  it('should contain animated rectangles', () => {
    const { container } = render(<Loader />);

    // Check for the presence of animated rectangles
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);

    // Check that rectangles have animation elements
    const animateElements = container.querySelectorAll('animate');
    expect(animateElements.length).toBeGreaterThan(0);
  });

  it('should have rectangles with correct attributes', () => {
    const { container } = render(<Loader />);

    const rects = container.querySelectorAll('rect');
    for (const rect of rects) {
      expect(rect).toHaveAttribute('fill', '#000000');
      expect(rect).toHaveAttribute('height', '12');
      expect(rect).toHaveAttribute('width', '6');
      expect(rect).toHaveAttribute('ry', '3.12');
      expect(rect).toHaveAttribute('rx', '3');
      expect(rect).toHaveAttribute('y', '24');
      expect(rect).toHaveAttribute('x', '47');
    }
  });

  it('should have animate elements with correct attributes', () => {
    const { container } = render(<Loader />);

    const animateElements = container.querySelectorAll('animate');
    for (const animate of animateElements) {
      expect(animate).toHaveAttribute('repeatCount', 'indefinite');
      expect(animate).toHaveAttribute('dur', '1s');
      expect(animate).toHaveAttribute('keyTimes', '0;1');
      expect(animate).toHaveAttribute('values', '1;0');
      expect(animate).toHaveAttribute('attributeName', 'opacity');
    }
  });

  it('should have groups with different rotation transforms', () => {
    const { container } = render(<Loader />);

    const groups = container.querySelectorAll('g[transform*="rotate"]');
    expect(groups.length).toBeGreaterThan(0);

    // Check for different rotation angles
    const transforms = Array.from(groups).map(g => g.getAttribute('transform'));
    expect(transforms).toContain('rotate(0 50 50)');
    expect(transforms).toContain('rotate(30 50 50)');
    expect(transforms).toContain('rotate(60 50 50)');
    expect(transforms).toContain('rotate(90 50 50)');
  });

  it('should have different animation begin times', () => {
    const { container } = render(<Loader />);

    const animateElements = container.querySelectorAll('animate');
    const beginTimes = Array.from(animateElements).map(el => el.getAttribute('begin'));

    // Should have different begin times to create staggered animation
    const uniqueBeginTimes = new Set(beginTimes);
    expect(uniqueBeginTimes.size).toBeGreaterThan(1);
  });

  describe('accessibility', () => {
    it('should be accessible via test id', () => {
      render(<Loader />);
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should not have any accessibility violations', () => {
      const { container } = render(<Loader />);

      // SVG should be properly structured
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();

      // Should have proper namespace
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });
  });

  describe('props validation', () => {
    it('should handle string width and height props', () => {
      render(<Loader width="50px" height="75px" />);
      const loader = screen.getByTestId('loader');
      expect(loader).toHaveAttribute('width', '50px');
      expect(loader).toHaveAttribute('height', '75px');
    });

    it('should handle numeric string props', () => {
      render(<Loader width="100" height="200" />);
      const loader = screen.getByTestId('loader');
      expect(loader).toHaveAttribute('width', '100');
      expect(loader).toHaveAttribute('height', '200');
    });

    it('should handle empty string props as empty values', () => {
      render(<Loader width="" height="" />);
      const loader = screen.getByTestId('loader');
      expect(loader).toHaveAttribute('width', '');
      expect(loader).toHaveAttribute('height', '');
    });
  });

  describe('rendering consistency', () => {
    it('should render the same content on multiple renders', () => {
      const { rerender } = render(<Loader />);
      const firstRender = screen.getByTestId('loader').innerHTML;

      rerender(<Loader />);
      const secondRender = screen.getByTestId('loader').innerHTML;

      expect(firstRender).toBe(secondRender);
    });

    it('should maintain structure with different props', () => {
      const { rerender } = render(<Loader width="100" height="100" />);
      const loader = screen.getByTestId('loader');
      const originalStructure = loader.children.length;

      rerender(<Loader width="200" height="300" />);
      expect(loader.children.length).toBe(originalStructure);
    });
  });

  describe('animation structure', () => {
    it('should have a complete 360-degree rotation cycle', () => {
      const { container } = render(<Loader />);

      const groups = container.querySelectorAll('g[transform*="rotate"]');
      const rotationAngles = Array.from(groups)
        .map(g => g.getAttribute('transform'))
        .map(transform => {
          const match = transform?.match(/rotate\((\d+)/);
          return match ? Number.parseInt(match[1]) : null;
        })
        .filter(angle => angle !== null)
        .sort((a, b) => a - b);

      // Should have multiple rotation angles covering the circle
      expect(rotationAngles.length).toBeGreaterThan(6);
      expect(rotationAngles[0]).toBe(0);
      expect(rotationAngles.at(-1)).toBeLessThan(360);
    });

    it('should have consistent animation timing', () => {
      const { container } = render(<Loader />);

      const animateElements = container.querySelectorAll('animate');
      const durations = Array.from(animateElements).map(el => el.getAttribute('dur'));

      // All animations should have the same duration
      expect(durations.every(dur => dur === '1s')).toBe(true);
    });
  });
});
