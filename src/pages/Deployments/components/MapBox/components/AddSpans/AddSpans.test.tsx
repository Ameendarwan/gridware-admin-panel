import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import AddSpans from './AddSpans';
import { LineType } from '@app/pages/Deployments/components/MapBox/types';

vi.mock('@app/pages/Deployments/components/MapBox/components/Span', () => ({
  default: ({ span, onUpdate }: any) => (
    <div>
      <span>{span.id}</span>
      <button onClick={() => onUpdate({ type: LineType.Secondary })}>Update Span</button>
    </div>
  ),
}));

describe('AddSpans Component', () => {
  let setSpans: ReturnType<typeof vi.fn>;
  let spans: any[];

  beforeEach(() => {
    spans = [
      { id: 1, type: LineType.Primary, phase: 1, line: 1 },
      { id: 2, type: LineType.Primary, phase: 1, line: 1 },
    ];
    setSpans = vi.fn();
  });

  const verifySpanUpdate = (setSpansMock: any, spans: any[], expectedType: any) => {
    expect(setSpansMock).toHaveBeenCalledWith(expect.any(Function));
    const updateFunction = setSpansMock.mock.calls[0][0];
    const updatedSpans = updateFunction(spans);
    expect(updatedSpans[0].type).toBe(expectedType);
    expect(updatedSpans[0].line).toBeUndefined();
    expect(updatedSpans[0].phase).toBeUndefined();
    return updatedSpans;
  };

  it('should render the AddSpans component', () => {
    render(<AddSpans spans={spans} setSpans={setSpans} />);

    // Check if the button is rendered
    const addButton = screen.getByTestId('add-span-btn');
    expect(addButton).toBeInTheDocument();

    // Check if spans are rendered
    for (const span of spans) {
      expect(screen.getByText(span.id)).toBeInTheDocument();
    }
  });

  it('should add a span when the "Add Span" button is clicked', async () => {
    render(<AddSpans spans={spans} setSpans={setSpans} />);

    // Click on the Add Span button
    const addButton = screen.getByTestId('add-span-btn');
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Check if setSpans is called with the new span data
    expect(setSpans).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should update a span when the "Update Span" button is clicked', async () => {
    render(<AddSpans spans={spans} setSpans={setSpans} />);

    // Find all the update buttons
    const updateButtons = screen.queryAllByText('Update Span');
    expect(updateButtons.length).toBe(spans.length);

    // Click the update button for the first span
    await act(async () => {
      fireEvent.click(updateButtons[0]);
    });

    // Verify the span update
    verifySpanUpdate(setSpans, spans, LineType.Secondary);
  });

  it('should call setSpans with the updated span when an update occurs', async () => {
    render(<AddSpans spans={spans} setSpans={setSpans} />);

    // Find all the "Update Span" buttons
    const updateButtons = screen.queryAllByText('Update Span');
    expect(updateButtons.length).toBe(spans.length);

    // Click the update button for the first span
    await act(async () => {
      fireEvent.click(updateButtons[0]);
    });

    // Verify the span update
    verifySpanUpdate(setSpans, spans, LineType.Secondary);
  });
});
