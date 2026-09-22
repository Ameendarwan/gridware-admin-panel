import BugDetails from './BugDetails';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('BugDetails', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <BugDetails />
      </MemoryRouter>
    );
    expect(true).toBe(true);
  });

  it('renders with MemoryRouter and does not throw', () => {
    expect(() => {
      render(
        <MemoryRouter>
          <BugDetails />
        </MemoryRouter>
      );
    }).not.toThrow();
  });

  it('renders and contains a form element', () => {
    const { container } = render(
      <MemoryRouter>
        <BugDetails />
      </MemoryRouter>
    );
    // Check for a form element (if present in the component)
    expect(container.querySelector('form')).toBeTruthy();
  });

  it('renders and matches snapshot', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <BugDetails />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
