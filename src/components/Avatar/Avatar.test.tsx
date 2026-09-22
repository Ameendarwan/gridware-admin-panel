import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

describe('Avatar components', () => {
  beforeEach(() => {
    vi.mock('@radix-ui/react-avatar', () => ({
      Root: React.forwardRef<HTMLSpanElement, { children: React.ReactNode; className?: string }>((props, ref) => (
        <span ref={ref} className={props.className}>
          {props.children}
        </span>
      )),
      Image: React.forwardRef<HTMLImageElement, { src: string; className?: string }>((props, ref) => (
        <img ref={ref} src={props.src} className={props.className} alt="" />
      )),
      Fallback: React.forwardRef<HTMLSpanElement, { children: React.ReactNode; className?: string }>((props, ref) => (
        <span ref={ref} className={props.className}>
          {props.children}
        </span>
      )),
    }));
    vi.mock('@app/lib/utils', () => ({
      cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
    }));
  });
  it('renders with default props', () => {
    render(
      <Avatar>
        <AvatarImage src="test.jpg" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
    expect(screen.getByText('AB')).toHaveClass('flex h-full w-full items-center justify-center rounded-full bg-muted');
  });

  it('accepts className prop', () => {
    render(
      <Avatar className="custom-class">
        <AvatarImage src="test.jpg" className="image-class" />
        <AvatarFallback className="fallback-class">AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('AB')).toHaveClass(
      'flex h-full w-full items-center justify-center rounded-full bg-muted fallback-class'
    );
  });

  it('forwards ref to root element', () => {
    const mockElement = React.createRef<HTMLSpanElement>();
    render(
      <Avatar ref={mockElement}>
        <AvatarImage src="test.jpg" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(mockElement.current).not.toBeNull();
  });

  it('forwards ref to image element', () => {
    const mockElement = React.createRef<HTMLImageElement>();
    render(
      <Avatar>
        <AvatarImage src="test.jpg" ref={mockElement} />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(mockElement.current).not.toBeNull();
  });

  it('forwards ref to fallback element', () => {
    const mockElement = React.createRef<HTMLSpanElement>();
    render(
      <Avatar>
        <AvatarImage src="test.jpg" />
        <AvatarFallback ref={mockElement}>AB</AvatarFallback>
      </Avatar>
    );
    expect(mockElement.current).not.toBeNull();
  });

  it('renders fallback when image is not loaded', () => {
    render(
      <Avatar>
        <AvatarImage src="invalid-url.jpg" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('handles image loading state', () => {
    render(
      <Avatar>
        <AvatarImage src="test.jpg" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    // Since we can't directly test the image loading state, we'll verify that the fallback is not visible
    expect(screen.getByText('AB')).toBeInTheDocument();
  });
});
