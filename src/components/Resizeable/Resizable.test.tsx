import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './Resizable';

// Mock the react-resizable-panels module
vi.mock('react-resizable-panels', () => {
  return {
    PanelGroup: ({ className, children, ...props }: any) => (
      <div data-testid="panel-group" className={className} {...props}>
        {children}
      </div>
    ),
    Panel: ({ className, children, ...props }: any) => (
      <div data-testid="panel" className={className} {...props}>
        {children}
      </div>
    ),
    PanelResizeHandle: ({ className, children, ...props }: any) => (
      <div data-testid="panel-resize-handle" className={className} {...props}>
        {children}
      </div>
    ),
  };
});

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  GripVertical: () => <div data-testid="grip-vertical-icon" />,
}));

// Mock cn utility
vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Resizable components', () => {
  describe('ResizablePanelGroup', () => {
    it('renders ResizablePanelGroup with default props', () => {
      render(<ResizablePanelGroup direction="horizontal" />);
      const panelGroup = screen.getByTestId('panel-group');
      expect(panelGroup).toBeInTheDocument();
      expect(panelGroup.className).toContain('flex h-full w-full');
    });

    it('renders ResizablePanelGroup with custom className', () => {
      render(<ResizablePanelGroup direction="horizontal" className="custom-panel-group" />);
      const panelGroup = screen.getByTestId('panel-group');
      expect(panelGroup.className).toContain('custom-panel-group');
    });

    it('forwards props to ResizablePanelGroup', () => {
      render(<ResizablePanelGroup direction="horizontal" data-custom="test-value" />);
      const panelGroup = screen.getByTestId('panel-group');
      expect(panelGroup).toHaveAttribute('data-custom', 'test-value');
    });
  });

  describe('ResizablePanel', () => {
    it('renders correctly', () => {
      render(<ResizablePanel>Panel content</ResizablePanel>);
      const panel = screen.getByTestId('panel');
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveTextContent('Panel content');
    });
  });

  describe('ResizableHandle', () => {
    it('renders without handle by default', () => {
      render(<ResizableHandle />);
      const handle = screen.getByTestId('panel-resize-handle');
      expect(handle).toBeInTheDocument();
      expect(screen.queryByTestId('grip-vertical-icon')).not.toBeInTheDocument();
    });

    it('renders with handle when withHandle is true', () => {
      render(<ResizableHandle withHandle />);
      const handle = screen.getByTestId('panel-resize-handle');
      expect(handle).toBeInTheDocument();
      expect(screen.getByTestId('grip-vertical-icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<ResizableHandle className="custom-handle" />);
      const handle = screen.getByTestId('panel-resize-handle');
      expect(handle.className).toContain('custom-handle');
    });
  });
});
