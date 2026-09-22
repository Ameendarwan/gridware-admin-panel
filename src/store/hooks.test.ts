import { describe, it, expect, vi } from 'vitest';
import { useDispatch, useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from './hooks';

// Mock react-redux
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

describe('store hooks', () => {
  describe('useAppDispatch', () => {
    it('should return the result of useDispatch', () => {
      const mockDispatch = vi.fn();
      vi.mocked(useDispatch).mockReturnValue(mockDispatch);

      const result = useAppDispatch();

      expect(useDispatch).toHaveBeenCalled();
      expect(result).toBe(mockDispatch);
    });

    it('should be typed correctly', () => {
      const mockDispatch = vi.fn();
      vi.mocked(useDispatch).mockReturnValue(mockDispatch);

      const dispatch = useAppDispatch();

      // This should not cause TypeScript errors
      dispatch({ type: 'TEST_ACTION' });

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'TEST_ACTION' });
    });
  });

  describe('useAppSelector', () => {
    it('should return the result of useSelector', () => {
      const mockSelector = vi.fn(state => state.test);
      vi.mocked(useSelector).mockReturnValue('value');

      const result = useAppSelector(mockSelector);

      expect(useSelector).toHaveBeenCalledWith(mockSelector);
      expect(result).toBe('value');
    });

    it('should work with different selector return types', () => {
      // Test with string
      vi.mocked(useSelector).mockReturnValue('string-value');
      const stringResult = useAppSelector(() => 'string-value');
      expect(stringResult).toBe('string-value');

      // Test with number
      vi.mocked(useSelector).mockReturnValue(42);
      const numberResult = useAppSelector(() => 42);
      expect(numberResult).toBe(42);

      // Test with boolean
      vi.mocked(useSelector).mockReturnValue(true);
      const booleanResult = useAppSelector(state => state.poles.isAddingPole);
      expect(booleanResult).toBe(true);

      // Test with object
      const mockObject = { id: 1, name: 'test' };
      vi.mocked(useSelector).mockReturnValue(mockObject);
      const objectResult = useAppSelector(state => state.poles.selectedPole);
      expect(objectResult).toBe(mockObject);

      // Test with array
      const mockArray = [1, 2, 3];
      vi.mocked(useSelector).mockReturnValue(mockArray);
      const arrayResult = useAppSelector(state => state.poles.polesList);
      expect(arrayResult).toBe(mockArray);
    });

    it('should handle undefined/null values', () => {
      vi.mocked(useSelector).mockReturnValue(undefined);
      const undefinedResult = useAppSelector(state => state.poles.mapRef);
      expect(undefinedResult).toBeUndefined();

      vi.mocked(useSelector).mockReturnValue(null);
      const nullResult = useAppSelector(state => state.poles.selectedPole);
      expect(nullResult).toBeNull();
    });
  });
});
