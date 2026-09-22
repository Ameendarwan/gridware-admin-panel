import { Mock, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';

import { IssueEntity } from '../../types';
import ValidationError from './ValidationError';
import { setSelectedPoleIdForValidation } from '@app/store/slices/polesSlice';

vi.mock('react-redux', async () => {
  const actual = await vi.importActual<typeof import('react-redux')>('react-redux');
  return {
    ...actual,
    useDispatch: vi.fn(),
    useSelector: vi.fn(),
  };
});

describe('ValidationError', () => {
  const mockError = {
    id: '456f1234-c56d-78a9-e876-098765432def',
    entity: 'pole' as IssueEntity,
    ids: [1255968335, 677891428],
    hint: 'Remove the none label or remove other equipment label',
    error: 'none is selected in isolation',
    is_warning: false,
  };

  const defaultProps = {
    issue: mockError,
    icon: 'warning' as const,
    color: 'red',
  };

  it('renders error IDs correctly', () => {
    render(<ValidationError {...defaultProps} />);
    for (const id of mockError.ids) {
      expect(screen.getByText(id.toString())).toBeInTheDocument();
    }
  });

  it('renders the error message', () => {
    render(<ValidationError {...defaultProps} />);
    expect(screen.getByText(mockError.error)).toBeInTheDocument();
  });

  it('highlights selected pole ID', () => {
    (useSelector as unknown as Mock).mockReturnValue(1255968335);
    render(<ValidationError {...defaultProps} />);
    const highlighted = screen.getByText('1255968335');
    expect(highlighted).toHaveClass('bg-yellow-50');
  });

  it('dispatches setSelectedPoleIdForValidation on pole ID click', () => {
    const mockDispatch = vi.fn();
    (useDispatch as unknown as Mock).mockReturnValue(mockDispatch);

    render(<ValidationError {...defaultProps} />);

    const poleId = screen.getByText('1255968335');
    fireEvent.click(poleId);
    expect(mockDispatch).toHaveBeenCalledWith(setSelectedPoleIdForValidation(1255968335));
  });
});
