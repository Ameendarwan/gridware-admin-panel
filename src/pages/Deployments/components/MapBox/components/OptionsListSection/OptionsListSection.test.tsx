import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import OptionsListSection from '../OptionsListSection';

describe('OptionsListSection', () => {
  it('renders children content', () => {
    render(
      <OptionsListSection>
        <div>Test Content</div>
      </OptionsListSection>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <OptionsListSection title="Test Title">
        <div>Content</div>
      </OptionsListSection>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    render(
      <OptionsListSection>
        <div>Content</div>
      </OptionsListSection>
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders save button when buttonTitle is provided', () => {
    render(
      <OptionsListSection buttonTitle="Save Changes">
        <div>Content</div>
      </OptionsListSection>
    );

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByTestId('options-list-save')).toBeInTheDocument();
  });

  it('calls onSaveClick when save button is clicked', () => {
    const mockOnSaveClick = vi.fn();

    render(
      <OptionsListSection buttonTitle="Save" onSaveClick={mockOnSaveClick}>
        <div>Content</div>
      </OptionsListSection>
    );

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockOnSaveClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className when provided', () => {
    render(
      <OptionsListSection className="custom-class">
        <div>Content</div>
      </OptionsListSection>
    );

    const contentContainer = screen.getByText('Content').parentElement;
    expect(contentContainer).toHaveClass('custom-class');
  });
});
