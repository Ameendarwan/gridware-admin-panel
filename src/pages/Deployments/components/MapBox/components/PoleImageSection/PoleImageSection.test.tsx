// Mock URL.createObjectURL for file/image preview
beforeAll(() => {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/dummy');
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';
import PoleImageSection from './PoleImageSection';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { edgesReducer } from '@app/store/slices/edgesSlice';
import { vi } from 'vitest';

// Mocks for child components and utils
vi.mock('@app/components/Carousel/Carousel', () => ({
  Carousel: ({ children }: any) => <div data-testid="carousel">{children}</div>,
  CarouselContent: ({ children }: any) => <div data-testid="carousel-content">{children}</div>,
  CarouselItem: ({ children }: any) => <div data-testid="carousel-item">{children}</div>,
  CarouselNext: ({ children }: any) => <button data-testid="carousel-next">{children}</button>,
  CarouselPrevious: ({ children }: any) => <button data-testid="carousel-prev">{children}</button>,
}));
vi.mock('./components/ImageActions', () => ({
  __esModule: true,
  default: ({ handleDeleteImage, setShowAllImages, handleImageType, showDelete }: any) => (
    <div data-testid="image-actions">
      {showDelete && (
        <button data-testid="delete-image" onClick={handleDeleteImage}>
          Delete
        </button>
      )}
      <button data-testid="show-all-images" onClick={() => setShowAllImages?.(true)}>
        Show All
      </button>
      <button data-testid="change-type" onClick={() => handleImageType?.('transmission')}>
        Change Type
      </button>
    </div>
  ),
}));
vi.mock('./components/ViewImage', () => ({
  __esModule: true,
  default: ({ setShowImage }: any) => (
    <div data-testid="view-image">
      <button onClick={() => setShowImage(false)}>Close</button>
    </div>
  ),
}));
vi.mock('@app/components/SVGIcon', () => ({
  __esModule: true,
  default: ({ icon }: any) => <span data-testid={`svg-icon-${icon}`}>{icon}</span>,
}));
vi.mock('@app/components/SelectDropdown', () => ({
  __esModule: true,
  default: ({ selectedValue, onSelect }: any) => (
    <select data-testid="select-dropdown" value={selectedValue} onChange={e => onSelect(e.target.value)}>
      <option value="pole">pole</option>
      <option value="transmission">transmission</option>
    </select>
  ),
}));
vi.mock('@app/components/Separator/Separator', () => ({
  Separator: () => <div data-testid="separator" />,
}));
vi.mock('@app/components/Bullet', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => (
    <button data-testid="bullet" {...props}>
      {children}
    </button>
  ),
}));
vi.mock('../OptionsListSection', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="options-list-section">{children}</div>,
}));
vi.mock('../../MapBox.utils', () => ({
  handleOpenGoogleMap: vi.fn(),
  poleImageTypes: ['pole', 'transmission'],
}));
vi.mock('@app/components/ConfirmationDialog', () => ({
  __esModule: true,
  default: ({ triggerComponent, confirmationComponent }: any) => (
    <div data-testid="confirmation-dialog">
      {triggerComponent}
      {confirmationComponent}
    </div>
  ),
}));
vi.mock('@app/assets/no-image.svg', () => ({ default: 'no-image.svg' }));
vi.mock('@app/components/TruncateText/TruncateText', () => ({
  __esModule: true,
  default: ({ value }: any) => <span data-testid="truncated-text">{value}</span>,
}));

const renderComponent = (initialState = {}, componentProps = {}) => {
  const store = configureStore({
    reducer: {
      edges: edgesReducer,
    },
    preloadedState: {
      edges: {
        selectedFromPole: -1,
        selectedToPole: -1,
        deploymentId: 2342423,
        edgesList: [],
        spansData: [],
        edgesMap: {},
        mode: MapMode.NOVIEW,
        selectedEdgeId: -1,
        isSelectingFromPole: false,
        isSelectingToPole: false,
        selectedPoleEdges: [],
        isSelectingEdge: -1,
        isDuplicateEdge: false,
        ...initialState,
      },
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          <PoleImageSection {...(componentProps as any)} />
        </BrowserRouter>
      </Provider>
    ),
  };
};

describe('PoleImageSection Component', () => {
  const basePole = {
    id: 1,
    pole_id: 'P-123',
    lat: 10,
    long: 20,
    images: [
      {
        file_id: 'img1',
        url: 'http://test.com/img1.jpg',
        extra: { meta_data: { type: 'pole' } },
      },
      {
        file_id: 'img2',
        url: 'http://test.com/img2.jpg',
        extra: { meta_data: { type: 'transmission' } },
      },
    ],
  };

  it('should render component with no images', () => {
    renderComponent(
      {
        mode: MapMode.POLEEDIT,
      },
      {
        pole: null,
        disableUpload: false,
        isPoleAddMode: false,
        poleIconName: 'marker-gs',
      }
    );
    expect(screen.getByTestId('no-image')).toBeInTheDocument();
    expect(screen.getByTestId('svg-icon-cross')).toBeInTheDocument();
    expect(screen.getByTestId('svg-icon-edit-pencil')).toBeInTheDocument();
    expect(screen.getByTestId('svg-icon-camera')).toBeInTheDocument();
  });

  it('should handle image file upload', async () => {
    const mockSetSelectedFiles = vi.fn();
    const mockSetSelectedImageTypes = vi.fn();

    renderComponent(
      {
        mode: MapMode.POLEEDIT,
      },
      {
        pole: { images: [] },
        disableUpload: false,
        isPoleAddMode: false,
        setSelectedFiles: mockSetSelectedFiles,
        setSelectedImageTypes: mockSetSelectedImageTypes,
        poleIconName: 'marker-gs',
      }
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockSetSelectedFiles).toHaveBeenCalledWith([file]);
      expect(mockSetSelectedImageTypes).toHaveBeenCalledWith(['pole']);
    });
  });

  it('should render images in carousel and allow viewing all images', () => {
    renderComponent(
      { mode: MapMode.POLEEDIT },
      { pole: basePole, disableUpload: false, isPoleAddMode: false, poleIconName: 'marker-gs' }
    );
    // At least one image should be present
    expect(screen.getAllByTestId('pole-images').length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getAllByTestId('pole-images')[0]);
    expect(screen.getByTestId('view-image')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
  });

  it('should call handleDeleteImage when delete button is clicked', () => {
    const mockSetDeletedFilesIds = vi.fn();
    renderComponent(
      { mode: MapMode.POLEEDIT },
      {
        pole: basePole,
        disableUpload: false,
        isPoleAddMode: false,
        setDeletedFilesIds: mockSetDeletedFilesIds,
        poleIconName: 'marker-gs',
      }
    );
    // Click the confirmation button to delete the image
    fireEvent.click(screen.getByText('Yes, delete'));
    // Should update deleted files state
    expect(mockSetDeletedFilesIds).toHaveBeenCalled();
  });

  it('should allow changing image type via dropdown', () => {
    const mockSetSelectedImageTypes = vi.fn();
    const mockSetSelectedFiles = vi.fn();
    renderComponent(
      { mode: MapMode.POLEEDIT },
      {
        pole: basePole,
        disableUpload: false,
        isPoleAddMode: false,
        setSelectedImageTypes: mockSetSelectedImageTypes,
        setSelectedFiles: mockSetSelectedFiles,
        selectedFiles: [new File(['dummy'], 'test.png', { type: 'image/png' })],
        selectedImageTypes: ['pole'],
        poleIconName: 'marker-gs',
      }
    );
    // Show uploaded files section
    fireEvent.click(screen.getAllByTestId('bullet')[1]);
    fireEvent.change(screen.getByTestId('select-dropdown'), { target: { value: 'transmission' } });
    expect(mockSetSelectedImageTypes).toHaveBeenCalled();
  });

  it('should disable upload and edit in add mode', () => {
    renderComponent(
      { mode: MapMode.POLEEDIT },
      { pole: basePole, disableUpload: true, isPoleAddMode: true, poleIconName: 'marker-gs' }
    );
    expect(screen.getByTestId('svg-icon-camera')).toBeInTheDocument();
    // Edit button should not be rendered when isPoleAddMode is true
    expect(screen.queryByTestId('svg-icon-edit-pencil')).not.toBeInTheDocument();
  });

  it('should show uploaded files section when showUploadedFiles is true', () => {
    const mockSetSelectedFiles = vi.fn();
    const mockSetSelectedImageTypes = vi.fn();
    renderComponent(
      { mode: MapMode.POLEEDIT },
      {
        pole: basePole,
        disableUpload: false,
        isPoleAddMode: false,
        setSelectedFiles: mockSetSelectedFiles,
        setSelectedImageTypes: mockSetSelectedImageTypes,
        selectedFiles: [new File(['dummy'], 'test.png', { type: 'image/png' })],
        selectedImageTypes: ['pole'],
        poleIconName: 'marker-gs',
      }
    );
    // Click bullet to show uploaded files
    fireEvent.click(screen.getAllByTestId('bullet')[1]);
    expect(screen.getByTestId('options-list-section')).toBeInTheDocument();
  });
});

it('should close the image view when cross icon is clicked', () => {
  const mockSetShowAllImages = vi.fn();

  const { store } = renderComponent(
    {
      mode: MapMode.POLEEDIT,
    },
    {
      pole: { images: [] },
      disableUpload: false,
      isPoleAddMode: false,
      setShowAllImages: mockSetShowAllImages,
      poleIconName: 'marker-gs',
    }
  );

  const closeButton = screen.getByTestId('image-section-cross-button');
  fireEvent.click(closeButton);

  const state = store.getState().edges;
  expect(state.mode).toBe(MapMode.NOVIEW);
});
// End of tests
