import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CsvComponent, { getColumns } from './CSV';

// Mock Grid to isolate CSV rendering
vi.mock('@app/components/Grid', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="mock-grid">GridMock {JSON.stringify(props)}</div>,
}));

describe('CSV', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <CsvComponent />
      </MemoryRouter>
    );
    expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
  });

  it('passes correct url prop to Grid', () => {
    render(
      <MemoryRouter>
        <CsvComponent />
      </MemoryRouter>
    );
    const grid = screen.getByTestId('mock-grid');
    expect(grid.textContent).toContain('"url":"/csv/all"');
  });

  it('exports getColumns as a function', () => {
    expect(typeof getColumns).toBe('function');
    // Optionally, test that it returns an array when called with mocks
    const mockNavigate = vi.fn();
    const mockSetSearchParams = vi.fn();
    const cols = getColumns(mockNavigate, mockSetSearchParams);
    expect(Array.isArray(cols)).toBe(true);
  });
});
