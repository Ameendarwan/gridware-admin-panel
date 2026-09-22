import { describe, it, expect, vi } from 'vitest';
import { formatDate } from './formatDate';
import { format } from 'date-fns';

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(),
}));

describe('formatDate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty input handling', () => {
    it.each([
      [null, 'null'],
      [undefined, 'undefined'],
      ['', 'empty string'],
    ])('should return empty string for %s input', (input, _description) => {
      const result = formatDate(input as any);
      expect(result).toBe('');
    });
  });

  describe('valid date formatting', () => {
    const testCases = [
      {
        dateString: '2023-12-25T15:30:00',
        expectedDate: '2023-12-25T15:30:00Z', // formatDate adds 'Z' if no timezone
        description: 'without timezone',
      },
      {
        dateString: '2023-12-25T15:30:00Z',
        expectedDate: '2023-12-25T15:30:00Z',
        description: 'with timezone',
      },
      {
        dateString: '2023-12-25T15:30:00+05:00',
        expectedDate: '2023-12-25T15:30:00+05:00',
        description: 'with offset timezone',
      },
    ];

    for (const { dateString, expectedDate, description } of testCases) {
      it(`should format valid date string ${description}`, () => {
        vi.mocked(format).mockReturnValue('12/25/2023 3:30 PM');

        const result = formatDate(dateString);

        expect(vi.mocked(format)).toHaveBeenCalledWith(new Date(expectedDate), 'MM/dd/yyyy h:mm a');
        expect(result).toBe('12/25/2023 3:30 PM');
      });
    }
  });

  it('should return original string for invalid date', () => {
    const invalidDate = 'invalid-date';
    const result = formatDate(invalidDate);

    expect(result).toBe(invalidDate);
  });

  describe('error handling', () => {
    it('should handle format function throwing error', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(format).mockImplementation(() => {
        throw new Error('Format error');
      });

      const dateString = '2023-12-25T15:30:00';
      const result = formatDate(dateString);

      expect(result).toBe(dateString);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle Date constructor throwing error', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Mock Date constructor to throw
      const originalDate = globalThis.Date;
      globalThis.Date = class extends Date {
        constructor(...args: any[]) {
          if (args.length > 0) {
            throw new Error('Date constructor error');
          }
          super();
        }
      } as any;

      const dateString = '2023-12-25T15:30:00';
      const result = formatDate(dateString);

      expect(result).toBe(dateString);
      expect(consoleSpy).toHaveBeenCalled();

      globalThis.Date = originalDate;
      consoleSpy.mockRestore();
    });
  });
});
