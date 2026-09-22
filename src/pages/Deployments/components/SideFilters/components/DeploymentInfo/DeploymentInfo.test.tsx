import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import DeploymentInfo from './DeploymentInfo';
import { Deployment, DeploymentStatus } from '@app/pages/Deployments/types';

// Mock the SVGIcon component
vi.mock('@app/components/SVGIcon', () => ({
  default: vi.fn(({ icon }) => <div data-testid={`svg-icon-${icon}`} />),
}));

// Mock the Label component
vi.mock('@app/components/Label/Label', () => ({
  Label: vi.fn(({ children, className, ...props }) => (
    <label className={className} {...props}>
      {children}
    </label>
  )),
}));

// Mock the Loader component
vi.mock('@app/components/Loader/Loader', () => ({
  default: vi.fn(({ width, height }) => (
    <div data-testid="loader" style={{ width, height }}>
      Loading...
    </div>
  )),
}));

// Mock deployment data
const mockDeploymentData: Deployment = {
  id: 123,
  name: 'Test Deployment',
  location: 'San Francisco, CA',
  status: DeploymentStatus.Installation,
  json_file: {
    extra: {
      meta_data: { filename: 'test.json', type: 'json' },
      content_type: 'application/json',
    },
    content_path: '/path/to/test.json',
    filename: 'test.json',
    content_type: 'application/json',
    size: 1024,
    files: ['test.json'],
    width: 0,
    height: 0,
    file_id: 'file_1',
    upload_storage: 'local',
    uploaded_at: '2023-01-01T00:00:00Z',
    path: '/uploads/test.json',
    url: 'https://example.com/test.json',
    saved: true,
  },
  kml_file: {
    extra: {
      meta_data: { filename: 'test.kml', type: 'kml' },
      content_type: 'application/vnd.google-earth.kml+xml',
    },
    content_path: '/path/to/test.kml',
    filename: 'test.kml',
    content_type: 'application/vnd.google-earth.kml+xml',
    size: 2048,
    files: ['test.kml'],
    width: 0,
    height: 0,
    file_id: 'file_2',
    upload_storage: 'local',
    uploaded_at: '2023-01-01T00:00:00Z',
    path: '/uploads/test.kml',
    url: 'https://example.com/test.kml',
    saved: true,
  },
  customer_id: 456,
  users: ['user1', 'user2'],
  created_by: 'admin',
  updated_by: 'admin',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  poles_count: 25,
};

describe('DeploymentInfo Component', () => {
  describe('Collapsed State', () => {
    it('should render empty fragment when collapsed', () => {
      const { container } = render(
        <DeploymentInfo isCollapsed={true} deploymentData={mockDeploymentData} isLoading={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render deployment name when collapsed', () => {
      render(<DeploymentInfo isCollapsed={true} deploymentData={mockDeploymentData} isLoading={false} />);

      expect(screen.queryByTestId('side-filter-deployment-name')).not.toBeInTheDocument();
    });
  });

  describe('Expanded State', () => {
    it('should render deployment header with tree icon and name when not collapsed', () => {
      render(<DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={false} />);

      expect(screen.getByTestId('svg-icon-tree')).toBeInTheDocument();
      expect(screen.getByTestId('side-filter-deployment-name')).toBeInTheDocument();
      expect(screen.getByText('Test Deployment')).toBeInTheDocument();
    });

    it('should render deployment information section when not collapsed', () => {
      render(<DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={false} />);

      // Check for section labels
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Pole Count')).toBeInTheDocument();

      // Check for data values
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should have correct CSS classes for the header', () => {
      render(<DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={false} />);

      const header = screen.getByTestId('side-filter-deployment-name').closest('div')?.parentElement;
      expect(header).toHaveClass(
        'flex',
        'w-full',
        'items-center',
        'justify-between',
        'gap-2.5',
        'whitespace-nowrap',
        'bg-white',
        'px-4',
        'pb-[20px]',
        'pt-[20px]'
      );
    });

    it('should have correct CSS classes for the info section', () => {
      const { container } = render(
        <DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={false} />
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass(
        'transition-[max-height, padding]',
        'flex',
        'max-h-[500px]',
        'w-full',
        'flex-col',
        'justify-center',
        'overflow-hidden',
        'border-b-[1px]',
        'bg-white',
        'px-4',
        'pb-3',
        'text-xs',
        'font-bold',
        'leading-none',
        'text-stone-900',
        'duration-300'
      );
    });
  });

  describe('Loading State', () => {
    it('should show loader when isLoading is true', () => {
      render(<DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={true} />);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByText('ID')).not.toBeInTheDocument();
      expect(screen.queryByText('Location')).not.toBeInTheDocument();
    });

    it('should render loader with correct dimensions', () => {
      render(<DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={true} />);

      const loader = screen.getByTestId('loader');
      expect(loader).toHaveStyle({ width: '50', height: '50' });
    });

    it('should still show deployment name when loading', () => {
      render(<DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={true} />);

      expect(screen.getByTestId('side-filter-deployment-name')).toBeInTheDocument();
      expect(screen.getByText('Test Deployment')).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('should handle undefined deploymentData gracefully', () => {
      render(<DeploymentInfo isCollapsed={false} deploymentData={undefined} isLoading={false} />);

      expect(screen.getByTestId('svg-icon-tree')).toBeInTheDocument();
      // The name field should be empty but the element should still exist
      expect(screen.getByTestId('side-filter-deployment-name')).toBeInTheDocument();
    });

    it('should handle deploymentData with missing fields', () => {
      const incompleteData = {
        ...mockDeploymentData,
        name: undefined,
        location: undefined,
        poles_count: undefined,
      } as any;

      render(<DeploymentInfo isCollapsed={false} deploymentData={incompleteData} isLoading={false} />);

      // Should still render structure
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Pole Count')).toBeInTheDocument();

      // Should still render the ID since it exists
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should render zero values correctly', () => {
      const zeroData = {
        ...mockDeploymentData,
        poles_count: 0,
      };

      render(<DeploymentInfo isCollapsed={false} deploymentData={zeroData} isLoading={false} />);

      // Should render zero values
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(1);
    });
  });

  describe('Default Props', () => {
    it('should work with minimal props', () => {
      render(<DeploymentInfo />);

      // Should render nothing when isCollapsed is undefined (falsy)
      expect(screen.getByTestId('svg-icon-tree')).toBeInTheDocument();
    });

    it('should handle isCollapsed being undefined', () => {
      render(<DeploymentInfo deploymentData={mockDeploymentData} isLoading={false} />);

      // isCollapsed defaults to falsy, so should render content
      expect(screen.getByTestId('side-filter-deployment-name')).toBeInTheDocument();
      expect(screen.getByText('Test Deployment')).toBeInTheDocument();
    });

    it('should handle isLoading being undefined', () => {
      render(<DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} />);

      // isLoading defaults to falsy, so should not show loader
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      expect(screen.getByText('ID')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render the correct layout structure', () => {
      const { container } = render(
        <DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={false} />
      );

      // Should have 2 direct children (div and section from the React Fragment)
      expect(container.children).toHaveLength(2);
      const divElement = container.querySelector('div');
      const sectionElement = container.querySelector('section');
      expect(divElement).toBeInTheDocument();
      expect(sectionElement).toBeInTheDocument();
    });

    it('should render data in correct grid layout', () => {
      render(<DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={false} />);

      // Check that ID and Location are in the same row
      const firstRowLabels = screen.getByText('ID').closest('div');
      expect(firstRowLabels).toContainElement(screen.getByText('Location'));
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading element for deployment name', () => {
      render(<DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={false} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Deployment');
    });

    it('should have semantic section element', () => {
      const { container } = render(
        <DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={false} />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should have proper test-id for deployment name', () => {
      render(<DeploymentInfo isCollapsed={false} deploymentData={mockDeploymentData} isLoading={false} />);

      expect(screen.getByTestId('side-filter-deployment-name')).toBeInTheDocument();
    });
  });
});
