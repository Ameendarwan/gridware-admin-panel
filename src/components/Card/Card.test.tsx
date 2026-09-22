import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './Card';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: vi.fn((...args) => args.join(' ')),
}));

describe('Card', () => {
  it('should render Card component', () => {
    render(<Card>Card Content</Card>);
    
    const card = screen.getByText('Card Content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-lg border-none bg-card text-card-foreground');
  });

  it('should render CardHeader component', () => {
    render(<CardHeader>Header Content</CardHeader>);
    
    const header = screen.getByText('Header Content');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('flex flex-col space-y-1.5 p-6');
  });

  it('should render CardTitle component', () => {
    render(<CardTitle>Title Content</CardTitle>);
    
    const title = screen.getByText('Title Content');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-2xl font-semibold leading-none tracking-tight');
  });

  it('should render CardDescription component', () => {
    render(<CardDescription>Description Content</CardDescription>);
    
    const description = screen.getByText('Description Content');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm text-muted-foreground');
  });

  it('should render CardContent component', () => {
    render(<CardContent>Content</CardContent>);
    
    const content = screen.getByText('Content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('p-6 pt-0');
  });

  it('should render CardFooter component', () => {
    render(<CardFooter>Footer Content</CardFooter>);
    
    const footer = screen.getByText('Footer Content');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('flex items-center p-6 pt-0');
  });

  it('should apply custom className to all components', () => {
    const { rerender } = render(<Card className="custom-class">Card</Card>);
    expect(screen.getByText('Card')).toHaveClass('custom-class');
    
    rerender(<CardHeader className="custom-header">Header</CardHeader>);
    expect(screen.getByText('Header')).toHaveClass('custom-header');
    
    rerender(<CardTitle className="custom-title">Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('custom-title');
    
    rerender(<CardDescription className="custom-desc">Description</CardDescription>);
    expect(screen.getByText('Description')).toHaveClass('custom-desc');
    
    rerender(<CardContent className="custom-content">Content</CardContent>);
    expect(screen.getByText('Content')).toHaveClass('custom-content');
    
    rerender(<CardFooter className="custom-footer">Footer</CardFooter>);
    expect(screen.getByText('Footer')).toHaveClass('custom-footer');
  });

  it('should forward ref correctly for all components', () => {
    const ref = { current: null };
    
    const { rerender } = render(<Card ref={ref}>Card</Card>);
    expect(ref.current).not.toBeNull();
    
    ref.current = null;
    rerender(<CardHeader ref={ref}>Header</CardHeader>);
    expect(ref.current).not.toBeNull();
    
    ref.current = null;
    rerender(<CardTitle ref={ref}>Title</CardTitle>);
    expect(ref.current).not.toBeNull();
    
    ref.current = null;
    rerender(<CardDescription ref={ref}>Description</CardDescription>);
    expect(ref.current).not.toBeNull();
    
    ref.current = null;
    rerender(<CardContent ref={ref}>Content</CardContent>);
    expect(ref.current).not.toBeNull();
    
    ref.current = null;
    rerender(<CardFooter ref={ref}>Footer</CardFooter>);
    expect(ref.current).not.toBeNull();
  });

  it('should render a complete card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });
});
