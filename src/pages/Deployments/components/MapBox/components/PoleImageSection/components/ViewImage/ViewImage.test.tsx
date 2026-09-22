import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import ViewImage from './ViewImage';
import { configureStore } from '@reduxjs/toolkit';
import { mockPoleImages } from '@app/mock/data/data';
import { sidebarsReducer } from '@app/store/slices/sidebarsSlice';

const mockSetShowImage = vi.fn();

const renderComponent = (initialState = {}) => {
  const store = configureStore({
    reducer: {
      sidebars: sidebarsReducer,
    },
    preloadedState: {
      sidebars: {
        isMainSidebarCollapsed: false,
        isSidebarFiltersCollapsed: false,
        ...initialState,
      },
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          <ViewImage images={mockPoleImages} setShowImage={mockSetShowImage} />
        </BrowserRouter>
      </Provider>
    ),
  };
};

describe('ViewImage Component', () => {
  it('renders the component correctly', () => {
    renderComponent();
    expect(screen.getByText('image1.jpg')).toBeInTheDocument();
    expect(screen.getByText('image2.jpg')).toBeInTheDocument();
  });

  it('should select an image when clicked', () => {
    renderComponent();

    const imageItem = screen.getByText('image1.jpg');
    fireEvent.click(imageItem);

    expect(screen.getByText('image1.jpg')).toHaveClass(
      'w-16 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold'
    );
  });

  it('should call setShowImage when close button is clicked', () => {
    renderComponent();
    const closeButton = screen.getByTestId('view-image-cross-button');
    fireEvent.click(closeButton);

    expect(mockSetShowImage).toHaveBeenCalledWith(false);
  });

  it('should update based on sidebar collapsed state', () => {
    renderComponent({
      isMainSidebarCollapsed: true,
    });

    const element = screen.getAllByTestId('view-image-container');
    expect(element[0]).toBeInTheDocument();

    expect(screen.getByTestId('view-image-container')).toHaveClass('left-[64px]');
  });
});
