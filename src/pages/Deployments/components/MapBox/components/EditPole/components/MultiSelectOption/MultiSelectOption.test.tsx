import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import MultiSelectOption from './MultiSelectOption';

describe('MultiSelectOption', () => {
  const mockProps = {
    title: 'Test Options',
    optionsList: ['Option 1', 'Option 2', 'OTHER'],
    saveButtonOnClick: vi.fn(),
    values: ['Option 1'],
    otherNote: 'Test note',
    onOtherSelect: vi.fn(),
    dataTestId: 'test',
  };

  it('renders component with initial values', () => {
    render(<MultiSelectOption {...mockProps} />);

    expect(screen.getByText('Test Options')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('opens options list when Edit button is clicked', () => {
    render(<MultiSelectOption {...mockProps} />);

    fireEvent.click(screen.getByTestId('test'));

    expect(screen.getByText('Close')).toBeInTheDocument();
    expect(screen.getByTestId('test-Option 1')).toBeInTheDocument();
    expect(screen.getByTestId('test-Option 2')).toBeInTheDocument();
    expect(screen.getByTestId('test-OTHER')).toBeInTheDocument();
  });

  it('shows textarea when OTHER option is selected', () => {
    render(<MultiSelectOption {...mockProps} />);

    fireEvent.click(screen.getByTestId('test'));
    fireEvent.click(screen.getByTestId('test-OTHER'));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('closes options list when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <MultiSelectOption {...mockProps} />
      </div>
    );

    fireEvent.click(screen.getByTestId('test'));
    expect(screen.getByText('Close')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('Save & Close')).not.toBeInTheDocument();
  });
});
