import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import HighlightText from '../HighlightText';

describe('HighlightText Component', () => {
  it('renders text without highlights when no matching words are found', () => {
    render(<HighlightText text="This is a test sentence." highlightWords={['React']} />);
    expect(screen.getByText('This is a test sentence.')).toBeInTheDocument();
  });

  it('highlights words that match the highlightWords list', () => {
    render(<HighlightText text="React is awesome!" highlightWords={['React']} highlightClassName="highlight" />);
    const highlightedText = screen.getByText('React');
    expect(highlightedText).toBeInTheDocument();
    expect(highlightedText).toHaveClass('highlight');
  });

  it('works with multiple highlight words', () => {
    render(
      <HighlightText
        text="React and JavaScript are powerful."
        highlightWords={['React', 'JavaScript']}
        highlightClassName="highlight"
      />
    );
    expect(screen.getByText('React')).toHaveClass('highlight');
    expect(screen.getByText('JavaScript')).toHaveClass('highlight');
  });

  it('renders multiple sentences correctly', () => {
    render(
      <HighlightText text={['React is great.', 'JavaScript is powerful.']} highlightWords={['React', 'JavaScript']} />
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('is case insensitive when highlighting words', () => {
    render(<HighlightText text="react is fun!" highlightWords={['React']} highlightClassName="highlight" />);
    const highlightedText = screen.getByText('react');
    expect(highlightedText).toHaveClass('highlight');
  });
});
