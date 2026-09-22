import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Bullet from './Bullet';

describe('Bullet', () => {
  it('should render the bullet component', () => {
    render(<Bullet />);
    
    const bullet = screen.getByTestId('bullet');
    expect(bullet).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Bullet className="custom-class" />);
    
    const bullet = screen.getByTestId('bullet');
    expect(bullet).toHaveClass('custom-class');
  });

  it('should render with specified background color', () => {
    render(<Bullet color="#ff0000" />);
    
    const bullet = screen.getByTestId('bullet');
    expect(bullet).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('should render children', () => {
    render(<Bullet>Test</Bullet>);
    
    const bullet = screen.getByTestId('bullet');
    expect(bullet).toHaveTextContent('Test');
  });

  it('should handle click events when not disabled', () => {
    const handleClick = vi.fn();
    render(<Bullet onClick={handleClick} />);
    
    const bullet = screen.getByTestId('bullet');
    fireEvent.click(bullet);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not handle click events when disabled', () => {
    const handleClick = vi.fn();
    render(<Bullet onClick={handleClick} disabled />);
    
    const bullet = screen.getByTestId('bullet');
    fireEvent.click(bullet);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply disabled styling when disabled', () => {
    render(<Bullet disabled />);
    
    const bullet = screen.getByTestId('bullet');
    expect(bullet).toHaveClass('cursor-not-allowed');
    expect(bullet).toHaveClass('opacity-50');
  });

  it('should apply cursor-pointer class when not disabled', () => {
    render(<Bullet />);
    
    const bullet = screen.getByTestId('bullet');
    expect(bullet).toHaveClass('cursor-pointer');
  });

  it('should pass additional props to the div element', () => {
    render(<Bullet data-custom="test-value" />);
    
    const bullet = screen.getByTestId('bullet');
    expect(bullet).toHaveAttribute('data-custom', 'test-value');
  });
});
