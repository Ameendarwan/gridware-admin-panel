import React from 'react';

interface HighlightTextProps {
  text: string | string[];
  highlightWords: string[];
  highlightClassName?: string;
}

const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlightWords,
  highlightClassName = 'bg-yellow-300 font-bold',
}) => {
  const getHighlightedText = (sentence: string) => {
    const regex = new RegExp(`\\b(${highlightWords.join('|')})\\b`, 'gi');
    return sentence.split(regex).map((part, index) =>
      highlightWords.some(word => word.toLowerCase() === part.toLowerCase()) ? (
        <span key={`${part}-${index}`} className={highlightClassName}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div>
      {Array.isArray(text) ? (
        text.map((sentence, idx) => <p key={`${sentence}-${idx}`}>{getHighlightedText(sentence)}</p>)
      ) : (
        <p>{getHighlightedText(text)}</p>
      )}
    </div>
  );
};

export default HighlightText;
