import React, { FC, useLayoutEffect, useRef, useState } from 'react';

import { Separator } from '@app/components/Separator/Separator';
import ValidationError from '@app/pages/Deployments/components/SideFilters/components/ValidationError/ValidationError';
import { ErrorRowsProps } from './types';

const ErrorRows: FC<ErrorRowsProps> = ({ index, style, data }) => {
  const { errors, selectedStage, setErrors, setRowHeight } = data;
  const error = errors?.[index];
  const rowRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(false);

  const handleIgnoreIssue = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, issueId: string) => {
    event.stopPropagation();

    // Determine if we're ignoring or unignoring
    const isCurrentlyIgnored = error.isIgnored;

    setErrors(prev => prev?.map(err => (err.id === issueId ? { ...err, isIgnored: !err.isIgnored } : err)));

    // Add to ignorableIssues when ignoring, remove when unignoring
    data?.setIgnorableIssues((prev: string[]) => {
      if (isCurrentlyIgnored) {
        // Unignoring: remove from the list
        return prev.filter(id => id !== issueId);
      } else {
        // Ignoring: add to the list
        return Array.from(new Set([...prev, issueId]));
      }
    });
  };

  // Use useLayoutEffect for synchronous measurement after DOM updates
  useLayoutEffect(() => {
    if (!rowRef.current || !setRowHeight) return;

    const measure = () => {
      const height = rowRef.current?.getBoundingClientRect().height;
      if (height && height > 0) {
        setRowHeight(index, height);
        setMeasured(true);
      }
    };

    // First attempt
    measure();

    // Fallback attempt after a frame
    requestAnimationFrame(() => {
      if (!measured) {
        measure();
      }
    });

    // Second fallback attempt
    const timeoutId = setTimeout(() => {
      if (!measured) {
        measure();
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [index, setRowHeight, error, measured]);

  if (!error) return null;

  return (
    <div
      style={{ ...style, height: 'auto' }}
      ref={rowRef}
      key={`${error.id}-${index}`} // Include index in key for stable identity
    >
      <ValidationError
        issue={error}
        icon={selectedStage.icon}
        color={selectedStage.activeColor}
        handleIgnoreIssue={handleIgnoreIssue}
      />
      <Separator />
    </div>
  );
};

export default ErrorRows;
