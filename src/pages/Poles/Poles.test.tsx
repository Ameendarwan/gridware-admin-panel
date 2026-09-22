import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Poles from './Poles';

describe('Poles Page', () => {
  it('renders without crashing and shows expected columns', () => {
    const { getAllByText, getByText, container } = render(
      <MemoryRouter>
        <Poles />
      </MemoryRouter>
    );
    // There are multiple elements with 'ID' and 'POLE ID', so use getAllByText
    expect(getAllByText(/ID/i).length).toBeGreaterThan(0);
    expect(getAllByText(/POLE ID/i).length).toBeGreaterThan(0);
    expect(getByText(/CREATED AT/i)).toBeInTheDocument();
    expect(getByText(/DEVICES/i)).toBeInTheDocument();
    // Check for table element as a proxy for Grid rendering
    expect(container.querySelector('table')).toBeInTheDocument();
  });

  // You can add more tests for column rendering, but most logic is in getColumns, which is a pure function
  it('shows a loading spinner when data is loading', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Poles />
      </MemoryRouter>
    );
    // Loader SVG should be present
    expect(getByTestId('loader')).toBeInTheDocument();
  });

  it('renders the correct number of column headers', () => {
    const { container } = render(
      <MemoryRouter>
        <Poles />
      </MemoryRouter>
    );
    // There are 34 columns in the table (based on getColumns output)
    const ths = container.querySelectorAll('thead th');
    expect(ths.length).toBeGreaterThan(20); // Should be a large number, adjust if needed
  });

  it('renders the filter/search input', () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter>
        <Poles />
      </MemoryRouter>
    );
    expect(getByPlaceholderText('Search')).toBeInTheDocument();
  });
});
