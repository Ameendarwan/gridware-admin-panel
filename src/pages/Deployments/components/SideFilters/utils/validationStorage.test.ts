import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { validationStorage } from './validationStorage';

describe('validationStorage', () => {
  // Mock localStorage
  const mockLocalStorage = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      keys: () => Object.keys(store),
    };
  })();

  beforeEach(() => {
    // Reset the mock store before each test
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();

    // Mock localStorage globally
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock Date.now for consistent timestamps
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('setValidationTask', () => {
    it('should store validation task with string noOfBatches', () => {
      const deploymentId = 'test-deployment-1';
      const backgroundTaskId = 'task-123';
      const noOfBatches = '5';
      const startTime = 1704067200000; // 2024-01-01T00:00:00Z

      validationStorage.setValidationTask(deploymentId, backgroundTaskId, noOfBatches, startTime);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'deployment_validation_test-deployment-1',
        JSON.stringify({
          backgroundTaskId,
          noOfBatches: 5,
          timestamp: 1704067200000,
          startTime,
        })
      );
    });

    it('should store validation task with number noOfBatches', () => {
      const deploymentId = 'test-deployment-2';
      const backgroundTaskId = 'task-456';
      const noOfBatches = 10;

      validationStorage.setValidationTask(deploymentId, backgroundTaskId, noOfBatches);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'deployment_validation_test-deployment-2',
        JSON.stringify({
          backgroundTaskId,
          noOfBatches: 10,
          timestamp: 1704067200000,
        })
      );
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const deploymentId = 'test-deployment-error';
      const backgroundTaskId = 'task-error';
      const noOfBatches = '3';

      // Should not throw
      expect(() => {
        validationStorage.setValidationTask(deploymentId, backgroundTaskId, noOfBatches);
      }).not.toThrow();

      expect(console.error).toHaveBeenCalledWith('Error storing validation task:', expect.any(Error));
    });
  });

  describe('getValidationTask', () => {
    it('should retrieve validation task successfully', () => {
      const deploymentId = 'test-deployment-1';
      const taskData = {
        backgroundTaskId: 'task-123',
        noOfBatches: 5,
        timestamp: Date.now(),
        startTime: 1704067200000,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(taskData));

      const result = validationStorage.getValidationTask(deploymentId);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('deployment_validation_test-deployment-1');
      expect(result).toEqual(taskData);
    });

    it('should return null when no data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = validationStorage.getValidationTask('non-existent-deployment');

      expect(result).toBeNull();
    });

    it('should remove expired task and return null', () => {
      const deploymentId = 'test-deployment-expired';
      const expiredTaskData = {
        backgroundTaskId: 'task-expired',
        noOfBatches: 3,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago (expired)
        startTime: 1704067200000,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredTaskData));

      const result = validationStorage.getValidationTask(deploymentId);

      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('deployment_validation_test-deployment-expired');
    });

    it('should handle JSON parsing errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const result = validationStorage.getValidationTask('test-deployment-invalid');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error retrieving validation task:', expect.any(Error));
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const result = validationStorage.getValidationTask('test-deployment-error');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error retrieving validation task:', expect.any(Error));
    });
  });

  describe('setValidationCompletionTime', () => {
    it('should update existing task with completion time', () => {
      const deploymentId = 'test-deployment-1';
      const completionTime = 1704070800000; // 1 hour later
      const existingTask = {
        backgroundTaskId: 'task-123',
        noOfBatches: 5,
        timestamp: Date.now(),
        startTime: 1704067200000,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingTask));

      validationStorage.setValidationCompletionTime(deploymentId, completionTime);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'deployment_validation_test-deployment-1',
        JSON.stringify({
          ...existingTask,
          completionTime,
        })
      );
    });

    it('should do nothing if no existing task found', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      validationStorage.setValidationCompletionTime('non-existent-deployment', Date.now());

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      // First, make getItem succeed to get past the initial check
      const existingTask = {
        backgroundTaskId: 'task-123',
        noOfBatches: 5,
        timestamp: Date.now(),
        startTime: 1704067200000,
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingTask));

      // Then make setItem throw an error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      validationStorage.setValidationCompletionTime('test-deployment-error', Date.now());

      expect(console.error).toHaveBeenCalledWith('Error updating validation completion time:', expect.any(Error));
    });
  });

  describe('removeValidationTask', () => {
    it('should remove validation task successfully', () => {
      const deploymentId = 'test-deployment-1';

      validationStorage.removeValidationTask(deploymentId);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('deployment_validation_test-deployment-1');
    });

    it('should handle removal errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed');
      });

      validationStorage.removeValidationTask('test-deployment-error');

      expect(console.error).toHaveBeenCalledWith('Error removing validation task:', expect.any(Error));
    });
  });

  describe('setValidationCompletion', () => {
    it('should store validation completion data', () => {
      const deploymentId = 'test-deployment-1';
      const startTime = 1704067200000;
      const completionTime = 1704070800000;

      validationStorage.setValidationCompletion(deploymentId, startTime, completionTime);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'deployment_validation_completed_test-deployment-1',
        JSON.stringify({
          startTime,
          completionTime,
          timestamp: 1704067200000,
        })
      );
    });

    it('should handle storage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      validationStorage.setValidationCompletion('test-deployment-error', Date.now(), Date.now());

      expect(console.error).toHaveBeenCalledWith('Error storing validation completion:', expect.any(Error));
    });
  });

  describe('getValidationCompletion', () => {
    it('should retrieve validation completion data successfully', () => {
      const deploymentId = 'test-deployment-1';
      const completionData = {
        startTime: 1704067200000,
        completionTime: 1704070800000,
        timestamp: Date.now(),
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(completionData));

      const result = validationStorage.getValidationCompletion(deploymentId);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('deployment_validation_completed_test-deployment-1');
      expect(result).toEqual(completionData);
    });

    it('should return null when no completion data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = validationStorage.getValidationCompletion('non-existent-deployment');

      expect(result).toBeNull();
    });

    it('should remove expired completion data and return null', () => {
      const deploymentId = 'test-deployment-expired';
      const expiredCompletionData = {
        startTime: 1704067200000,
        completionTime: 1704070800000,
        timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago (expired)
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredCompletionData));

      const result = validationStorage.getValidationCompletion(deploymentId);

      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'deployment_validation_completed_test-deployment-expired'
      );
    });

    it('should handle JSON parsing errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const result = validationStorage.getValidationCompletion('test-deployment-invalid');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error retrieving validation completion:', expect.any(Error));
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const result = validationStorage.getValidationCompletion('test-deployment-error');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error retrieving validation completion:', expect.any(Error));
    });
  });

  describe('removeValidationCompletion', () => {
    it('should remove validation completion data successfully', () => {
      const deploymentId = 'test-deployment-1';

      validationStorage.removeValidationCompletion(deploymentId);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('deployment_validation_completed_test-deployment-1');
    });

    it('should handle removal errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed');
      });

      validationStorage.removeValidationCompletion('test-deployment-error');

      expect(console.error).toHaveBeenCalledWith('Error removing validation completion:', expect.any(Error));
    });
  });

  describe('clearAllValidationTasks', () => {
    it('should clear all validation-related keys from localStorage', () => {
      // Setup mock localStorage with various keys by directly mocking Object.keys
      const mockKeys = [
        'deployment_validation_test1',
        'deployment_validation_test2',
        'deployment_validation_completed_test3',
        'deployment_validation_completed_test4',
        'other_key',
        'another_key',
      ];

      // Mock Object.keys(localStorage) to return our test keys
      const objectKeysSpy = vi.spyOn(Object, 'keys').mockReturnValueOnce(mockKeys);

      validationStorage.clearAllValidationTasks();

      // Should remove only validation-related keys
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('deployment_validation_test1');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('deployment_validation_test2');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('deployment_validation_completed_test3');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('deployment_validation_completed_test4');

      // Should not remove non-validation keys
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('other_key');
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('another_key');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(4);

      // Restore the spy
      objectKeysSpy.mockRestore();
    });

    it('should handle errors gracefully when clearing tasks', () => {
      // Create a spy that will only affect our specific call
      const objectKeysSpy = vi.spyOn(Object, 'keys');

      // First call (for our test) should throw
      objectKeysSpy.mockImplementationOnce(() => {
        throw new Error('Cannot access localStorage keys');
      });

      validationStorage.clearAllValidationTasks();

      expect(console.error).toHaveBeenCalledWith('Error clearing validation tasks:', expect.any(Error));

      // Restore the spy
      objectKeysSpy.mockRestore();
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle very large noOfBatches numbers', () => {
      const deploymentId = 'test-large-batches';
      const backgroundTaskId = 'task-large';
      const noOfBatches = '999999999';

      validationStorage.setValidationTask(deploymentId, backgroundTaskId, noOfBatches);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'deployment_validation_test-large-batches',
        JSON.stringify({
          backgroundTaskId,
          noOfBatches: 999999999,
          timestamp: 1704067200000,
        })
      );
    });

    it('should handle invalid noOfBatches string', () => {
      const deploymentId = 'test-invalid-batches';
      const backgroundTaskId = 'task-invalid';
      const noOfBatches = 'not-a-number';

      validationStorage.setValidationTask(deploymentId, backgroundTaskId, noOfBatches);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'deployment_validation_test-invalid-batches',
        JSON.stringify({
          backgroundTaskId,
          noOfBatches: Number.NaN,
          timestamp: 1704067200000,
        })
      );
    });

    it('should handle empty deployment IDs', () => {
      const deploymentId = '';
      const backgroundTaskId = 'task-empty-id';
      const noOfBatches = '5';

      validationStorage.setValidationTask(deploymentId, backgroundTaskId, noOfBatches);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('deployment_validation_', expect.any(String));
    });

    it('should handle special characters in deployment IDs', () => {
      const deploymentId = 'test-deployment-@#$%^&*()';
      const backgroundTaskId = 'task-special';
      const noOfBatches = '3';

      validationStorage.setValidationTask(deploymentId, backgroundTaskId, noOfBatches);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'deployment_validation_test-deployment-@#$%^&*()',
        expect.any(String)
      );
    });

    it('should work correctly with tasks at expiry boundary', () => {
      const deploymentId = 'test-boundary';
      const taskData = {
        backgroundTaskId: 'task-boundary',
        noOfBatches: 5,
        timestamp: Date.now() - (24 * 60 * 60 * 1000 - 1000), // 1 second before expiry
        startTime: 1704067200000,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(taskData));

      const result = validationStorage.getValidationTask(deploymentId);

      // Should still be valid (not expired)
      expect(result).toEqual(taskData);
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should work correctly with completion data at expiry boundary', () => {
      const deploymentId = 'test-completion-boundary';
      const completionData = {
        startTime: 1704067200000,
        completionTime: 1704070800000,
        timestamp: Date.now() - (2 * 60 * 60 * 1000 - 1000), // 1 second before expiry
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(completionData));

      const result = validationStorage.getValidationCompletion(deploymentId);

      // Should still be valid (not expired)
      expect(result).toEqual(completionData);
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });
});
