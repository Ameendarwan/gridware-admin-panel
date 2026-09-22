import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from './Layout';
import { vi } from 'vitest';

// Mock the Header component
vi.mock('@app/components/Header', () => ({
  default: () => <div data-testid="header-component">Header</div>,
}));

// Mock the Sidebar component
vi.mock('@app/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar-component">Sidebar</div>,
}));

// Mock the Toaster component
vi.mock('../Toaster/Toaster', () => ({
  Toaster: () => <div data-testid="toaster-component">Toaster</div>,
}));

describe('Layout', () => {
  it('should render with all its parts', () => {
    render(
      <Layout>
        <div data-testid="content">Test Content</div>
      </Layout>
    );
    
    // Check if all components are rendered
    expect(screen.getByTestId('header-component')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-component')).toBeInTheDocument();
    expect(screen.getByTestId('toaster-component')).toBeInTheDocument();
    
    // Check if the children are rendered
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply correct layout classes', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // Check if the main container has the correct classes
    const container = screen.getByText('Test Content').parentElement;
    expect(container).toHaveClass('flex-1');
    expect(container).toHaveClass('overflow-auto');
    expect(container).toHaveClass('bg-white');
  });
});
