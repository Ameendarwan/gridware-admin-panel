interface ValidationTask {
  backgroundTaskId: string;
  noOfBatches: number;
  timestamp: number;
  startTime?: number;
  completionTime?: number;
}

const VALIDATION_STORAGE_KEY_PREFIX = 'deployment_validation_';
const VALIDATION_COMPLETION_KEY_PREFIX = 'deployment_validation_completed_';
const TASK_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const COMPLETION_EXPIRY_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

const getStorageKey = (deploymentId: string) => `${VALIDATION_STORAGE_KEY_PREFIX}${deploymentId}`;
const getCompletionStorageKey = (deploymentId: string) => `${VALIDATION_COMPLETION_KEY_PREFIX}${deploymentId}`;

export const validationStorage = {
  // Store validation task info
  setValidationTask: (
    deploymentId: string,
    backgroundTaskId: string,
    noOfBatches: string | number,
    startTime?: number
  ) => {
    try {
      const task: ValidationTask = {
        backgroundTaskId,
        noOfBatches: typeof noOfBatches === 'string' ? Number.parseInt(noOfBatches, 10) : noOfBatches,
        timestamp: Date.now(),
        startTime,
      };

      localStorage.setItem(getStorageKey(deploymentId), JSON.stringify(task));
    } catch (error) {
      console.error('Error storing validation task:', error);
    }
  },

  // Get validation task info
  getValidationTask: (deploymentId: string): ValidationTask | null => {
    try {
      const storedData = localStorage.getItem(getStorageKey(deploymentId));
      if (!storedData) return null;

      const task = JSON.parse(storedData);

      // Check if task is expired
      if (Date.now() - task.timestamp > TASK_EXPIRY_TIME) {
        validationStorage.removeValidationTask(deploymentId);
        return null;
      }

      return task;
    } catch (error) {
      console.error('Error retrieving validation task:', error);
      return null;
    }
  },

  // Update validation task with completion time
  setValidationCompletionTime: (deploymentId: string, completionTime: number) => {
    try {
      const existingTask = validationStorage.getValidationTask(deploymentId);
      if (existingTask) {
        const updatedTask: ValidationTask = {
          ...existingTask,
          completionTime,
        };
        localStorage.setItem(getStorageKey(deploymentId), JSON.stringify(updatedTask));
      }
    } catch (error) {
      console.error('Error updating validation completion time:', error);
    }
  },

  // Remove validation task
  removeValidationTask: (deploymentId: string) => {
    try {
      localStorage.removeItem(getStorageKey(deploymentId));
    } catch (error) {
      console.error('Error removing validation task:', error);
    }
  },

  // Store validation completion info (persists after task is removed)
  setValidationCompletion: (deploymentId: string, startTime: number, completionTime: number) => {
    try {
      const completionData = {
        startTime,
        completionTime,
        timestamp: Date.now(),
      };
      localStorage.setItem(getCompletionStorageKey(deploymentId), JSON.stringify(completionData));
    } catch (error) {
      console.error('Error storing validation completion:', error);
    }
  },

  // Get validation completion info
  getValidationCompletion: (deploymentId: string) => {
    try {
      const storedData = localStorage.getItem(getCompletionStorageKey(deploymentId));
      if (!storedData) return null;

      const completion = JSON.parse(storedData);

      // Check if completion data is expired (2 hours)
      if (Date.now() - completion.timestamp > COMPLETION_EXPIRY_TIME) {
        validationStorage.removeValidationCompletion(deploymentId);
        return null;
      }

      return completion;
    } catch (error) {
      console.error('Error retrieving validation completion:', error);
      return null;
    }
  },

  // Remove validation completion
  removeValidationCompletion: (deploymentId: string) => {
    try {
      localStorage.removeItem(getCompletionStorageKey(deploymentId));
    } catch (error) {
      console.error('Error removing validation completion:', error);
    }
  },

  // Clear all validation tasks
  clearAllValidationTasks: () => {
    try {
      // Get all keys and remove those matching our prefix
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(VALIDATION_STORAGE_KEY_PREFIX) || key.startsWith(VALIDATION_COMPLETION_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error clearing validation tasks:', error);
    }
  },
};
