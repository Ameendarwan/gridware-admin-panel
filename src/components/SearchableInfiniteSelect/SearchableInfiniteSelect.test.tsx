import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { API } from '@app/lib/api-config';
import SearchableInfiniteSelect from './SearchableInfiniteSelect';

// Mock the API
vi.mock('@app/lib/api-config', () => ({
  API: {
    get: vi.fn(),
  },
}));

// Mock react-window to avoid ref warning and add key prop
vi.mock('react-window', () => ({
  FixedSizeList: React.forwardRef(({ children, itemCount }: { children: any; itemCount: number }) => (
    <div data-testid="virtual-list">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={`list-item-${index}`}>{children({ index, style: {} })}</div>
      ))}
    </div>
  )),
}));

const mockOptions = [
  { id: 1, name: 'Option 1' },
  { id: 2, name: 'Option 2' },
  { id: 3, name: 'Option 3' },
];

const defaultProps = {
  fetchUrl: '/api/options',
  pageSize: 10,
  placeholder: 'Select an option',
  responseMapper: (item: any) => ({
    value: item.id.toString(),
    label: item.name,
  }),
  dataTestId: 'test-select',
};

describe('SearchableInfiniteSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (API.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          records: mockOptions,
        },
      },
    });
  });

  it('renders with placeholder text', () => {
    render(<SearchableInfiniteSelect {...defaultProps} />);
    expect(screen.getByTestId('test-select-value')).toHaveTextContent('Select an option');
  });

  it('opens dropdown on click', async () => {
    render(<SearchableInfiniteSelect {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('test-select-trigger'));
    });

    expect(screen.getByTestId('test-select-dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('test-select-search-input')).toBeInTheDocument();
  });

  it('fetches options on initial render when dropdown opens', async () => {
    render(<SearchableInfiniteSelect {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('test-select-trigger'));
    });

    await waitFor(() => {
      expect(API.get).toHaveBeenCalledWith('/api/options', {
        params: {
          skip: 0,
          limit: 10,
        },
      });
    });
  });

  it('handles search input', async () => {
    render(<SearchableInfiniteSelect {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('test-select-trigger'));
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId('test-select-search-input'), {
        target: { value: 'test search' },
      });
    });

    await waitFor(() => {
      expect(API.get).toHaveBeenCalledWith('/api/options', {
        params: {
          skip: 0,
          limit: 10,
          where: 'test search',
        },
      });
    });
  });

  it('handles single select', async () => {
    const onValueChange = vi.fn();
    render(<SearchableInfiniteSelect {...defaultProps} onValueChange={onValueChange} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('test-select-trigger'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('test-select-option-1')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('test-select-option-1'));
    });

    expect(onValueChange).toHaveBeenCalledWith(['1']);
    expect(screen.getByTestId('test-select-value')).toHaveTextContent('Option 1');

    await act(async () => {
      fireEvent.click(screen.getByTestId('test-select-trigger'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('test-select-option-selected-1')).toBeInTheDocument();
    });
  });

  it('handles multi-select', async () => {
    const onValueChange = vi.fn();
    render(<SearchableInfiniteSelect {...defaultProps} multiSelect={true} onValueChange={onValueChange} />);

    // Open dropdown
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-select-trigger'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('test-select-option-1')).toBeInTheDocument();
    });

    // Select multiple options
    fireEvent.click(screen.getByTestId('test-select-option-1'));
    fireEvent.click(screen.getByTestId('test-select-option-2'));

    expect(screen.getByTestId('test-select-option-selected-1')).toBeInTheDocument();
    expect(screen.getByTestId('test-select-option-selected-2')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    (API.get as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<SearchableInfiniteSelect {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('test-select-trigger'));
    });

    expect(screen.getByTestId('test-select-loading')).toBeInTheDocument();
  });

  it('shows no options message when empty', async () => {
    (API.get as jest.Mock).mockResolvedValueOnce({
      data: {
        data: {
          records: [],
        },
      },
    });

    render(<SearchableInfiniteSelect {...defaultProps} />);

    fireEvent.click(screen.getByTestId('test-select-trigger'));

    await waitFor(() => {
      expect(screen.getByTestId('test-select-no-options')).toBeInTheDocument();
    });
  });

  it('handles disabled state', async () => {
    render(<SearchableInfiniteSelect {...defaultProps} disabled={true} />);

    const trigger = screen.getByTestId('test-select-trigger');
    expect(trigger.className).toContain('cursor-not-allowed opacity-50');

    await act(async () => {
      fireEvent.click(trigger);
    });

    expect(screen.queryByTestId('test-select-dropdown')).not.toBeInTheDocument();
  });
});
