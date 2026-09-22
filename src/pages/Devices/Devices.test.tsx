import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Devices from './Devices';
import { vi } from 'vitest';

const navigate = vi.fn();
const setSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual: any = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
    useSearchParams: () => [undefined, setSearchParams],
    Link: (props: any) => <a {...props}>{props.children}</a>,
  };
});
vi.mock('@app/components/Grid', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="grid-mock">
      <button onClick={props.onButtonClick}>{props.buttonText}</button>
      <span>Grid url: {props.url}</span>
      <span>Columns: {typeof props.getColumns === 'function' ? 'function' : 'none'}</span>
    </div>
  ),
}));
vi.mock('@app/routes/urls', () => ({ urls: { devices: { create: '/devices/create', list: '/devices' } } }));

describe('Devices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Grid with correct props and handles button click', () => {
    render(
      <MemoryRouter>
        <Devices />
      </MemoryRouter>
    );
    expect(screen.getByTestId('grid-mock')).toBeInTheDocument();
    expect(screen.getByText('Grid url: /device/all')).toBeInTheDocument();
    expect(screen.getByText('Columns: function')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /new device/i });
    fireEvent.click(btn);
    expect(navigate).toHaveBeenCalledWith('/devices/create');
  });
});
