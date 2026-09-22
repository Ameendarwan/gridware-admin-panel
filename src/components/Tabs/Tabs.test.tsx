import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

// Mock cn utility
vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Mock Radix UI Tabs primitives
vi.mock('@radix-ui/react-tabs', () => {
  const React = require('react');
  
  return {
    Root: ({ children, defaultValue, ...props }: React.PropsWithChildren<any>) => (
      <div data-testid="tabs-root" data-default-value={defaultValue} {...props}>
        {children}
      </div>
    ),
    List: React.forwardRef(({ children, className, ...props }: React.PropsWithChildren<any>, ref: any) => (
      <div data-testid="tabs-list" className={className} ref={ref} {...props}>
        {children}
      </div>
    )),
    Trigger: React.forwardRef(({ children, className, ...props }: React.PropsWithChildren<any>, ref: any) => (
      <button data-testid="tabs-trigger" className={className} ref={ref} {...props}>
        {children}
      </button>
    )),
    Content: React.forwardRef(({ children, className, ...props }: React.PropsWithChildren<any>, ref: any) => (
      <div data-testid="tabs-content" className={className} ref={ref} {...props}>
        {children}
      </div>
    )),
  };
});

describe('Tabs components', () => {
  describe('Tabs', () => {
    it('renders with children', () => {
      render(
        <Tabs defaultValue="tab1" data-testid="tabs-test">
          <div>Tabs content</div>
        </Tabs>
      );
      
      const tabs = screen.getByTestId('tabs-test');
      expect(tabs).toBeInTheDocument();
      // Check if the defaultValue was passed correctly
      expect(tabs).toHaveAttribute('data-default-value', 'tab1');
      expect(tabs).toHaveTextContent('Tabs content');
    });
  });

  describe('TabsList', () => {
    it('renders with default props', () => {
      render(
        <TabsList>
          <div>List content</div>
        </TabsList>
      );
      
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toBeInTheDocument();
      expect(tabsList.className).toContain('inline-flex');
      expect(tabsList.className).toContain('h-10');
      expect(tabsList.className).toContain('bg-muted');
      expect(tabsList).toHaveTextContent('List content');
    });

    it('applies custom className', () => {
      render(
        <TabsList className="custom-list">
          <div>List content</div>
        </TabsList>
      );
      
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList.className).toContain('custom-list');
    });

    it('forwards props to underlying component', () => {
      render(
        <TabsList data-custom="test-value">
          <div>List content</div>
        </TabsList>
      );
      
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveAttribute('data-custom', 'test-value');
    });
  });

  describe('TabsTrigger', () => {
    it('renders with default props', () => {
      render(
        <TabsTrigger value="tab1">
          Tab 1
        </TabsTrigger>
      );
      
      const tabsTrigger = screen.getByTestId('tabs-trigger');
      expect(tabsTrigger).toBeInTheDocument();
      expect(tabsTrigger.className).toContain('inline-flex');
      expect(tabsTrigger.className).toContain('items-center');
      expect(tabsTrigger.className).toContain('justify-center');
      expect(tabsTrigger).toHaveTextContent('Tab 1');
      expect(tabsTrigger).toHaveAttribute('value', 'tab1');
    });

    it('applies custom className', () => {
      render(
        <TabsTrigger value="tab1" className="custom-trigger">
          Tab 1
        </TabsTrigger>
      );
      
      const tabsTrigger = screen.getByTestId('tabs-trigger');
      expect(tabsTrigger.className).toContain('custom-trigger');
    });

    it('forwards props to underlying component', () => {
      render(
        <TabsTrigger value="tab1" disabled data-custom="test-value">
          Tab 1
        </TabsTrigger>
      );
      
      const tabsTrigger = screen.getByTestId('tabs-trigger');
      expect(tabsTrigger).toHaveAttribute('disabled', '');
      expect(tabsTrigger).toHaveAttribute('data-custom', 'test-value');
    });
  });

  describe('TabsContent', () => {
    it('renders with default props', () => {
      render(
        <TabsContent value="tab1">
          Content for Tab 1
        </TabsContent>
      );
      
      const tabsContent = screen.getByTestId('tabs-content');
      expect(tabsContent).toBeInTheDocument();
      expect(tabsContent.className).toContain('mt-2');
      expect(tabsContent.className).toContain('ring-offset-background');
      expect(tabsContent).toHaveTextContent('Content for Tab 1');
      expect(tabsContent).toHaveAttribute('value', 'tab1');
    });

    it('applies custom className', () => {
      render(
        <TabsContent value="tab1" className="custom-content">
          Content for Tab 1
        </TabsContent>
      );
      
      const tabsContent = screen.getByTestId('tabs-content');
      expect(tabsContent.className).toContain('custom-content');
    });

    it('forwards props to underlying component', () => {
      render(
        <TabsContent value="tab1" data-custom="test-value">
          Content for Tab 1
        </TabsContent>
      );
      
      const tabsContent = screen.getByTestId('tabs-content');
      expect(tabsContent).toHaveAttribute('data-custom', 'test-value');
    });
  });

  it('renders a complete tabs example', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
        <TabsContent value="tab2">Content for Tab 2</TabsContent>
      </Tabs>
    );
    
    const tabsRoot = screen.getByTestId('tabs-root');
    const tabsList = screen.getByTestId('tabs-list');
    const tabsTriggers = screen.getAllByTestId('tabs-trigger');
    const tabsContents = screen.getAllByTestId('tabs-content');
    
    expect(tabsRoot).toBeInTheDocument();
    expect(tabsList).toBeInTheDocument();
    expect(tabsTriggers).toHaveLength(2);
    expect(tabsContents).toHaveLength(2);
    expect(tabsTriggers[0]).toHaveTextContent('Tab 1');
    expect(tabsTriggers[1]).toHaveTextContent('Tab 2');
    expect(tabsContents[0]).toHaveTextContent('Content for Tab 1');
    expect(tabsContents[1]).toHaveTextContent('Content for Tab 2');
  });
});
