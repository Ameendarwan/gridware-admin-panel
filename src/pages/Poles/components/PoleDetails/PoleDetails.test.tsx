import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PoleDetails from './PoleDetails';
import * as apiConfig from '@app/lib/api-config';
import { vi } from 'vitest';

// Mock dependencies
vi.mock('@app/lib/api-config', () => ({
  API: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Mock subcomponents that are not critical for form logic
vi.mock('@app/components/SearchableDevices', () => ({ default: () => <div>SearchableDevices</div> }));
vi.mock('@app/components/SearchableDeployments', () => ({ default: () => <div>SearchableDeployments</div> }));
vi.mock('@app/components/MultiSelect', () => ({ default: () => <div>MultiSelect</div> }));
vi.mock('@app/components/Loader/Loader', () => ({ default: () => <div data-testid="loader" /> }));

const renderWithRouter = (route = '/poles/123/edit') => {
  globalThis.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/poles/:id/:mode" element={<PoleDetails />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('PoleDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Patch scrollIntoView and focus for all elements
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      value: vi.fn(),
      writable: true,
    });
    Object.defineProperty(HTMLElement.prototype, 'focus', {
      value: vi.fn(),
      writable: true,
    });
  });

  it('renders loader when loading', () => {
    renderWithRouter();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('fetches and displays pole data in edit mode', async () => {
    const mockData = {
      data: {
        data: {
          id: '123',
          pole_id: 'P-001',
          lat: 10,
          long: 20,
          status: 'Active',
          status_type: 'Good',
          deployment_id: 1,
          devices: [],
          images: [],
          images_metadata: [],
          vegetation_condition: [],
          network_strength: 'Strong',
          solar_strength: 'Strong',
          created_by: 'user',
          updated_by: 'user',
        },
      },
    };
    (apiConfig.API.get as any).mockResolvedValueOnce(mockData);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByDisplayValue('P-001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    (apiConfig.API.get as any).mockRejectedValueOnce(new Error('API error'));
    renderWithRouter();
    await waitFor(() => {
      // Loader should disappear
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('focuses on first error field on validation error', async () => {
    renderWithRouter();
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      // Should show validation errors (look for any error message)
      expect(screen.queryAllByText(content => /required|must|enter/i.test(content)).length).toBeGreaterThan(0);
    });
  });
});
