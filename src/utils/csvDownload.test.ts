import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadCSV } from './csvDownload';

// Mock DOM APIs
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

// Mock console.warn
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('downloadCSV', () => {
  let mockLink: any;

  beforeEach(() => {
    // Setup mock link element
    mockLink = {
      href: '',
      download: '',
      style: { visibility: '' },
      click: mockClick,
      remove: vi.fn(),
    };

    // Mock DOM methods
    globalThis.document = {
      createElement: mockCreateElement,
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
    } as any;

    // Mock URL methods
    globalThis.URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    } as any;

    // Mock Blob
    globalThis.Blob = vi.fn().mockImplementation((content, options) => ({
      content,
      options,
    }));

    mockCreateElement.mockReturnValue(mockLink);
    mockCreateObjectURL.mockReturnValue('mock-url');

    vi.clearAllMocks();
  });

  afterEach(() => {
    mockConsoleWarn.mockClear();
  });

  describe('with valid data', () => {
    it('should create CSV with default headers', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Boston' },
      ];

      downloadCSV(data, 'test');

      expect(globalThis.Blob).toHaveBeenCalledWith(['name,age,city\nJohn,30,New York\nJane,25,Boston'], {
        type: 'text/csv;charset=utf-8;',
      });
    });

    it('should create CSV with custom headers', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      const headers = { name: 'Full Name', age: 'Age' };

      downloadCSV(data, 'test', headers);

      expect(globalThis.Blob).toHaveBeenCalledWith(['Full Name,Age\nJohn,30\nJane,25'], {
        type: 'text/csv;charset=utf-8;',
      });
    });

    it('should handle values with commas', () => {
      const data = [{ name: 'John, Jr.', city: 'New York, NY' }];

      downloadCSV(data, 'test');

      expect(globalThis.Blob).toHaveBeenCalledWith(['name,city\n"John, Jr.","New York, NY"'], {
        type: 'text/csv;charset=utf-8;',
      });
    });

    it('should handle values with quotes', () => {
      const data = [{ name: 'John "Johnny" Doe', description: 'He said "Hello"' }];

      downloadCSV(data, 'test');

      expect(globalThis.Blob).toHaveBeenCalledWith(['name,description\n"John ""Johnny"" Doe","He said ""Hello"""'], {
        type: 'text/csv;charset=utf-8;',
      });
    });

    it('should handle values with newlines', () => {
      const data = [{ name: 'John', description: 'Line 1\nLine 2' }];

      downloadCSV(data, 'test');

      expect(globalThis.Blob).toHaveBeenCalledWith(['name,description\nJohn,"Line 1\nLine 2"'], {
        type: 'text/csv;charset=utf-8;',
      });
    });

    it('should handle null and undefined values', () => {
      const data = [{ name: 'John', age: null, city: undefined }];

      downloadCSV(data, 'test');

      expect(globalThis.Blob).toHaveBeenCalledWith(['name,age,city\nJohn,,'], { type: 'text/csv;charset=utf-8;' });
    });

    it('should force text format when option is enabled', () => {
      const data = [{ id: '001', name: 'John' }];

      downloadCSV(data, 'test', undefined, { forceTextFormat: true });

      expect(globalThis.Blob).toHaveBeenCalledWith(['id,name\n"=""001""","=""John"""'], {
        type: 'text/csv;charset=utf-8;',
      });
    });

    it('should not force text format for empty values', () => {
      const data = [{ id: '', name: 'John' }];

      downloadCSV(data, 'test', undefined, { forceTextFormat: true });

      expect(globalThis.Blob).toHaveBeenCalledWith(['id,name\n,"=""John"""'], { type: 'text/csv;charset=utf-8;' });
    });
  });

  describe('with empty data', () => {
    it('should create empty CSV when no data and no headers', () => {
      downloadCSV([], 'test');

      expect(mockConsoleWarn).toHaveBeenCalledWith('No data and no headers provided for CSV export');
      expect(globalThis.Blob).toHaveBeenCalledWith([''], { type: 'text/csv;charset=utf-8;' });
    });

    it('should create CSV with default headers when no data', () => {
      const defaultHeaders = ['Name', 'Age', 'City'];

      downloadCSV([], 'test', undefined, { defaultHeaders });

      expect(globalThis.Blob).toHaveBeenCalledWith(['Name,Age,City'], { type: 'text/csv;charset=utf-8;' });
    });

    it('should create CSV with custom headers when no data', () => {
      const headers = { name: 'Full Name', age: 'Age' };

      downloadCSV([], 'test', headers);

      expect(globalThis.Blob).toHaveBeenCalledWith(['Full Name,Age'], { type: 'text/csv;charset=utf-8;' });
    });

    it('should handle null data', () => {
      downloadCSV(null as any, 'test');

      expect(mockConsoleWarn).toHaveBeenCalledWith('No data and no headers provided for CSV export');
      expect(globalThis.Blob).toHaveBeenCalledWith([''], { type: 'text/csv;charset=utf-8;' });
    });
  });

  describe('download functionality', () => {
    it('should create and trigger download link', () => {
      const data = [{ name: 'John' }];

      downloadCSV(data, 'test-file');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    it('should set correct filename', () => {
      const data = [{ name: 'John' }];

      downloadCSV(data, 'my-export');

      expect(mockLink.download).toBe('my-export.csv');
    });

    it('should set link as hidden', () => {
      const data = [{ name: 'John' }];

      downloadCSV(data, 'test');

      expect(mockLink.style.visibility).toBe('hidden');
    });
  });
});
