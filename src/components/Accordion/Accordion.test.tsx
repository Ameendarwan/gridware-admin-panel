import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';

// Mock the ChevronDown icon
vi.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-icon">ChevronIcon</div>,
}));

// Mock the cn utility
vi.mock('@app/lib/utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}));

import { cn } from '@app/lib/utils';

describe('Accordion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render accordion with items', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    expect(screen.getByText('Trigger 1')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
  });

  it('should toggle content when trigger is clicked', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    // Content should not be visible initially
    const region = screen.getByRole('region', { hidden: true });
    expect(region).toHaveAttribute('hidden');
    
    // Click the trigger
    fireEvent.click(screen.getByText('Trigger 1'));
    
    // Content should be visible after click
    expect(screen.getByRole('region')).not.toHaveAttribute('hidden');
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('should handle multiple items in single mode', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    // Click first trigger
    fireEvent.click(screen.getByText('Trigger 1'));
    
    // Verify first item is open
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    
    // Click second trigger
    fireEvent.click(screen.getByText('Trigger 2'));
    
    // In single mode, second content should be visible
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    
    // Check that the first item's trigger is in closed state
    const firstTrigger = screen.getByText('Trigger 1').closest('button');
    expect(firstTrigger).toHaveAttribute('data-state', 'closed');
    
    // Check that the second item's trigger is in open state
    const secondTrigger = screen.getByText('Trigger 2').closest('button');
    expect(secondTrigger).toHaveAttribute('data-state', 'open');
  });

  it('should handle multiple items in multiple mode', () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    // Click first trigger
    fireEvent.click(screen.getByText('Trigger 1'));
    expect(screen.getByText('Content 1')).toBeVisible();
    
    // Click second trigger
    fireEvent.click(screen.getByText('Trigger 2'));
    
    // In multiple mode, both contents should be visible
    expect(screen.getByText('Content 1')).toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('should apply custom className to AccordionItem', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1" className="custom-item-class">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    expect(vi.mocked(cn)).toHaveBeenCalledWith('border-b', 'custom-item-class');
  });

  it('should apply custom className to AccordionTrigger', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger className="custom-trigger-class">Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    expect(vi.mocked(cn)).toHaveBeenCalledWith(
      'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
      'custom-trigger-class'
    );
  });

  it('should apply custom className to AccordionContent', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent className="custom-content-class">Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    expect(vi.mocked(cn)).toHaveBeenCalledWith('pb-4 pt-0', 'custom-content-class');
  });

  it('should forward ref correctly for AccordionItem', () => {
    const ref = vi.fn();
    render(
      <Accordion type="single">
        <AccordionItem ref={ref} value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    expect(ref).toHaveBeenCalled();
  });

  it('should forward ref correctly for AccordionTrigger', () => {
    const ref = vi.fn();
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger ref={ref}>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    expect(ref).toHaveBeenCalled();
  });

  it('should forward ref correctly for AccordionContent', () => {
    const ref = vi.fn();
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent ref={ref}>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    expect(ref).toHaveBeenCalled();
  });
});
