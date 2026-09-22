import { describe, it, expect, vi } from 'vitest';
import { cn } from './utils';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Mock clsx and twMerge
vi.mock('clsx', () => ({
  clsx: vi.fn(),
}));

vi.mock('tailwind-merge', () => ({
  twMerge: vi.fn(),
}));

describe('cn utility function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call clsx with provided inputs', () => {
    vi.mocked(clsx).mockReturnValue('clsx-result');
    vi.mocked(twMerge).mockReturnValue('merged-result');

    const inputs = ['class1', 'class2', { active: true }];
    cn(...inputs);

    expect(vi.mocked(clsx)).toHaveBeenCalledWith(inputs);
  });

  it('should call twMerge with clsx result', () => {
    vi.mocked(clsx).mockReturnValue('clsx-result');
    vi.mocked(twMerge).mockReturnValue('final-merged-result');

    const inputs = ['class1', 'class2'];
    const result = cn(...inputs);

    expect(vi.mocked(twMerge)).toHaveBeenCalledWith('clsx-result');
    expect(result).toBe('final-merged-result');
  });

  it('should return the result of twMerge', () => {
    vi.mocked(clsx).mockReturnValue('clsx-result');
    vi.mocked(twMerge).mockReturnValue('final-merged-result');

    const result = cn('class1', 'class2');

    expect(result).toBe('final-merged-result');
  });

  it('should handle empty inputs', () => {
    vi.mocked(clsx).mockReturnValue('');
    vi.mocked(twMerge).mockReturnValue('');

    const result = cn();

    expect(vi.mocked(clsx)).toHaveBeenCalledWith([]);
    expect(vi.mocked(twMerge)).toHaveBeenCalledWith('');
    expect(result).toBe('');
  });

  it('should handle single input', () => {
    vi.mocked(clsx).mockReturnValue('single-class');
    vi.mocked(twMerge).mockReturnValue('single-class');

    const result = cn('single-class');

    expect(vi.mocked(clsx)).toHaveBeenCalledWith(['single-class']);
    expect(vi.mocked(twMerge)).toHaveBeenCalledWith('single-class');
    expect(result).toBe('single-class');
  });

  it('should handle multiple string inputs', () => {
    vi.mocked(clsx).mockReturnValue('class1 class2 class3');
    vi.mocked(twMerge).mockReturnValue('merged-classes');

    const result = cn('class1', 'class2', 'class3');

    expect(vi.mocked(clsx)).toHaveBeenCalledWith(['class1', 'class2', 'class3']);
    expect(vi.mocked(twMerge)).toHaveBeenCalledWith('class1 class2 class3');
    expect(result).toBe('merged-classes');
  });

  it('should handle conditional classes', () => {
    vi.mocked(clsx).mockReturnValue('base-class active-class');
    vi.mocked(twMerge).mockReturnValue('merged-conditional');

    const result = cn('base-class', { 'active-class': true, 'inactive-class': false });

    expect(vi.mocked(clsx)).toHaveBeenCalledWith(['base-class', { 'active-class': true, 'inactive-class': false }]);
    expect(vi.mocked(twMerge)).toHaveBeenCalledWith('base-class active-class');
    expect(result).toBe('merged-conditional');
  });

  it('should handle arrays of classes', () => {
    vi.mocked(clsx).mockReturnValue('array-class1 array-class2');
    vi.mocked(twMerge).mockReturnValue('merged-array');

    const result = cn(['array-class1', 'array-class2']);

    expect(vi.mocked(clsx)).toHaveBeenCalledWith([['array-class1', 'array-class2']]);
    expect(vi.mocked(twMerge)).toHaveBeenCalledWith('array-class1 array-class2');
    expect(result).toBe('merged-array');
  });

  it('should handle mixed input types', () => {
    vi.mocked(clsx).mockReturnValue('mixed-result');
    vi.mocked(twMerge).mockReturnValue('final-mixed-result');

    const result = cn(
      'string-class',
      ['array-class1', 'array-class2'],
      { 'conditional-class': true },
      undefined,
      null
    );

    expect(vi.mocked(clsx)).toHaveBeenCalledWith([
      'string-class',
      ['array-class1', 'array-class2'],
      { 'conditional-class': true },
      undefined,
      null
    ]);
    expect(vi.mocked(twMerge)).toHaveBeenCalledWith('mixed-result');
    expect(result).toBe('final-mixed-result');
  });
});
