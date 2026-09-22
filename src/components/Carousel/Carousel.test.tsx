import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './Carousel';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}));

// Create a mock API that we'll use throughout the tests
const mockEmblaApi = {
  canScrollPrev: vi.fn().mockReturnValue(true),
  canScrollNext: vi.fn().mockReturnValue(true),
  scrollPrev: vi.fn(),
  scrollNext: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

// Mock embla-carousel-react with our mock API
vi.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [{ current: null }, mockEmblaApi],
}));

// Mock SVGIcon component
vi.mock('../SVGIcon', () => ({
  default: ({ icon, className }: { icon: string; className?: string }) => (
    <div data-testid={`svg-icon-${icon}`} className={className}>
      {icon} icon
    </div>
  ),
}));

// Mock Bullet component
vi.mock('../Bullet', () => ({
  default: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button
      data-testid="bullet-component"
      className={className}
      onClick={disabled ? undefined : onClick}
      data-disabled={disabled ? 'true' : 'false'}
      type="button">
      {children}
    </button>
  ),
}));

describe('Carousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock API state before each test
    mockEmblaApi.canScrollPrev.mockReturnValue(true);
    mockEmblaApi.canScrollNext.mockReturnValue(true);
  });

  it('should render Carousel component', () => {
    render(
      <Carousel>
        <div>Carousel Content</div>
      </Carousel>
    );

    expect(screen.getByText('Carousel Content')).toBeInTheDocument();
    expect(screen.getByLabelText('carousel')).toBeInTheDocument();
  });

  it('should render CarouselContent component', () => {
    render(
      <Carousel>
        <CarouselContent>
          <div>Content</div>
        </CarouselContent>
      </Carousel>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should render CarouselItem component', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('should render CarouselPrevious component', () => {
    render(
      <Carousel>
        <CarouselPrevious />
      </Carousel>
    );

    const previousButton = screen.getByTestId('bullet-component');
    expect(previousButton).toBeInTheDocument();
    expect(screen.getByTestId('svg-icon-chevron')).toBeInTheDocument();
  });

  it('should render CarouselNext component', () => {
    render(
      <Carousel>
        <CarouselNext />
      </Carousel>
    );

    const nextButton = screen.getByTestId('bullet-component');
    expect(nextButton).toBeInTheDocument();
    expect(screen.getByTestId('svg-icon-chevron')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', () => {
    mockEmblaApi.scrollPrev.mockClear();
    mockEmblaApi.scrollNext.mockClear();

    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    const carousel = screen.getByRole('region');

    // Test left arrow key
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
    expect(mockEmblaApi.scrollPrev).toHaveBeenCalled();

    // Test right arrow key
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(mockEmblaApi.scrollNext).toHaveBeenCalled();
  });

  it('should handle click on previous button', () => {
    mockEmblaApi.scrollPrev.mockClear();

    render(
      <Carousel>
        <CarouselPrevious />
      </Carousel>
    );

    const previousButton = screen.getByTestId('bullet-component');
    fireEvent.click(previousButton);

    expect(mockEmblaApi.scrollPrev).toHaveBeenCalled();
  });

  it('should handle click on next button', () => {
    mockEmblaApi.scrollNext.mockClear();

    render(
      <Carousel>
        <CarouselNext />
      </Carousel>
    );

    const nextButton = screen.getByTestId('bullet-component');
    fireEvent.click(nextButton);

    expect(mockEmblaApi.scrollNext).toHaveBeenCalled();
  });

  it('should disable previous button when cannot scroll prev', () => {
    mockEmblaApi.canScrollPrev.mockReturnValue(false);

    render(
      <Carousel>
        <CarouselPrevious />
      </Carousel>
    );

    const previousButton = screen.getByTestId('bullet-component');
    expect(previousButton).toHaveAttribute('data-disabled', 'true');
  });

  it('should disable next button when cannot scroll next', () => {
    mockEmblaApi.canScrollNext.mockReturnValue(false);

    render(
      <Carousel>
        <CarouselNext />
      </Carousel>
    );

    const nextButton = screen.getByTestId('bullet-component');
    expect(nextButton).toHaveAttribute('data-disabled', 'true');
  });

  it('should set api when setApi prop is provided', () => {
    const setApi = vi.fn();

    render(
      <Carousel setApi={setApi}>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    expect(setApi).toHaveBeenCalledWith(mockEmblaApi);
  });

  it('should render a complete carousel with all subcomponents', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
          <CarouselItem>Slide 3</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );

    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
    expect(screen.getByText('Slide 3')).toBeInTheDocument();
    expect(screen.getAllByTestId('bullet-component')).toHaveLength(2);
    expect(screen.getAllByTestId('svg-icon-chevron')).toHaveLength(2);
  });

  it('should apply custom className to all components', () => {
    render(
      <Carousel className="custom-carousel">
        <CarouselContent className="custom-content">
          <CarouselItem className="custom-item">Slide</CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="custom-prev" />
        <CarouselNext className="custom-next" />
      </Carousel>
    );

    expect(screen.getByRole('region')).toHaveClass('custom-carousel');

    // Check for custom classes in the mocked components
    const bullets = screen.getAllByTestId('bullet-component');
    expect(bullets[0].className).toContain('custom-prev');
    expect(bullets[1].className).toContain('custom-next');
  });
});
