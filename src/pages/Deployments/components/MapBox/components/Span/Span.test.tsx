import { LineType, SpanT } from '@app/pages/Deployments/components/MapBox/types';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import Span from '../Span';

describe('Span Component', () => {
  const mockSpan: SpanT = {
    id: 1,
    line: 1,
    phase: 1,
    type: LineType.Primary,
  };

  const mockSpanTypesCount = {
    primary: true,
    transmission: true,
    secondary: true,
  };

  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders correctly with initial values', () => {
    render(
      <Span spanTypesCount={mockSpanTypesCount} onRemove={mockOnRemove} span={mockSpan} onUpdate={mockOnUpdate} />
    );

    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Line')).toBeInTheDocument();
    expect(screen.getByText('Phase')).toBeInTheDocument();
  });

  it('handles line quantity changes', () => {
    render(
      <Span spanTypesCount={mockSpanTypesCount} onRemove={mockOnRemove} span={mockSpan} onUpdate={mockOnUpdate} />
    );

    const incrementBtn = screen.getAllByTestId('increment-btn')[1];
    fireEvent.click(incrementBtn);

    expect(mockOnUpdate).toHaveBeenCalledWith({ line: 2 });
  });

  it('handles phase quantity changes', () => {
    render(
      <Span
        spanTypesCount={mockSpanTypesCount}
        onRemove={mockOnRemove}
        span={{ ...mockSpan, line: 2, phase: 1 }}
        onUpdate={mockOnUpdate}
      />
    );

    const incrementBtn = screen.getAllByTestId('increment-btn')[0];
    fireEvent.click(incrementBtn);

    expect(mockOnUpdate).toHaveBeenCalledWith({ phase: 2 });
  });

  it('disables line and phase controls when type is Secondary', async () => {
    render(
      <Span spanTypesCount={mockSpanTypesCount} onRemove={mockOnRemove} span={mockSpan} onUpdate={mockOnUpdate} />
    );

    // Open the select dropdown
    const typeSelect = screen.getByTestId('line-type-select');
    fireEvent.click(typeSelect);

    // Select Secondary option
    const secondaryOption = screen.getByText('S');
    fireEvent.click(secondaryOption);

    // Check if onUpdate was called with correct type
    expect(mockOnUpdate).toHaveBeenCalledWith({ type: LineType.Secondary });

    // Verify that line, phase options not rendered for secondary type
    expect(screen.queryByText('Line')).not.toBeInTheDocument();
    expect(screen.queryByText('Phase')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('decrement-btn')).toHaveLength(0);
    expect(screen.queryAllByTestId('increment-btn')).toHaveLength(0);
  });

  it('prevents decrementing line/phase below 1', () => {
    render(
      <Span spanTypesCount={mockSpanTypesCount} onRemove={mockOnRemove} span={mockSpan} onUpdate={mockOnUpdate} />
    );

    const decrementBtns = screen.getAllByTestId('decrement-btn');

    // Try to decrement both line and phase
    for (const btn of decrementBtns) {
      fireEvent.click(btn);
    }

    // onUpdate should not be called since we're at minimum value
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('prevents incrementing line/phase above 10', () => {
    const spanWithMaxValues: SpanT = {
      ...mockSpan,
      line: 10,
      phase: 10,
    };

    render(
      <Span
        spanTypesCount={mockSpanTypesCount}
        onRemove={mockOnRemove}
        span={spanWithMaxValues}
        onUpdate={mockOnUpdate}
      />
    );

    const incrementBtns = screen.getAllByTestId('increment-btn');

    // Try to increment both line and phase
    for (const btn of incrementBtns) {
      fireEvent.click(btn);
    }

    // onUpdate should not be called since we're at maximum value
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });
});
