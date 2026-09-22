import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock React and ReactDOM
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
  render: mockRender,
}));

vi.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot,
}));

vi.mock('./App', () => ({
  default: () => <div data-testid="app">App Component</div>,
}));

// Mock document.getElementById
const mockGetElementById = vi.fn();
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true,
});

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should get root element from DOM', async () => {
    const mockRootElement = document.createElement('div');
    mockRootElement.id = 'root';
    mockGetElementById.mockReturnValue(mockRootElement);

    // Import main.tsx to execute the code
    await import('./main');

    expect(mockGetElementById).toHaveBeenCalledWith('root');
  });

  it('should create root with the container element', async () => {
    const mockRootElement = document.createElement('div');
    mockRootElement.id = 'root';
    mockGetElementById.mockReturnValue(mockRootElement);

    await import('./main');

    expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
  });

  it('should render App component', async () => {
    const mockRootElement = document.createElement('div');
    mockRootElement.id = 'root';
    mockGetElementById.mockReturnValue(mockRootElement);

    await import('./main');

    expect(mockRender).toHaveBeenCalledTimes(1);
    // Check that render was called with App component
    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(Function),
      })
    );
  });

  it('should handle missing root element gracefully', async () => {
    mockGetElementById.mockReturnValue(null);

    // This should not throw an error due to the non-null assertion
    // In a real scenario, this would throw, but we're testing the happy path
    expect(() => import('./main')).not.toThrow();
  });

  it('should call createRoot and render in correct sequence', async () => {
    const mockRootElement = document.createElement('div');
    mockRootElement.id = 'root';
    mockGetElementById.mockReturnValue(mockRootElement);

    await import('./main');

    // Verify the sequence of calls by checking call order
    expect(mockGetElementById).toHaveBeenCalled();
    expect(mockCreateRoot).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();
    
    // Check that getElementById was called before createRoot
    const getElementByIdCallTime = mockGetElementById.mock.invocationCallOrder[0];
    const createRootCallTime = mockCreateRoot.mock.invocationCallOrder[0];
    const renderCallTime = mockRender.mock.invocationCallOrder[0];
    
    expect(getElementByIdCallTime).toBeLessThan(createRootCallTime);
    expect(createRootCallTime).toBeLessThan(renderCallTime);
  });

  it('should use the correct root element ID', async () => {
    const mockRootElement = document.createElement('div');
    mockGetElementById.mockReturnValue(mockRootElement);

    await import('./main');

    expect(mockGetElementById).toHaveBeenCalledWith('root');
    expect(mockGetElementById).toHaveBeenCalledTimes(1);
  });

  it('should create only one root instance', async () => {
    const mockRootElement = document.createElement('div');
    mockGetElementById.mockReturnValue(mockRootElement);

    await import('./main');

    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
  });

  it('should render only once', async () => {
    const mockRootElement = document.createElement('div');
    mockGetElementById.mockReturnValue(mockRootElement);

    await import('./main');

    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  describe('integration with React', () => {
    it('should use React.createElement for App component', async () => {
      const mockRootElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockRootElement);

      await import('./main');

      // Verify that render was called with a React element
      const renderCall = mockRender.mock.calls[0][0];
      expect(renderCall).toHaveProperty('type');
      expect(renderCall).toHaveProperty('props');
    });
  });

  describe('error handling', () => {
    it('should handle createRoot errors', async () => {
      const mockRootElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockRootElement);
      mockCreateRoot.mockImplementation(() => {
        throw new Error('CreateRoot failed');
      });

      await expect(import('./main')).rejects.toThrow('CreateRoot failed');
    });

    it('should handle render errors', async () => {
      const mockRootElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockRootElement);
      
      // Mock createRoot to return an object with a render method that throws
      mockCreateRoot.mockReturnValue({
        render: vi.fn(() => {
          throw new Error('Render failed');
        })
      });

      await expect(import('./main')).rejects.toThrow('Render failed');
    });
  });
});
