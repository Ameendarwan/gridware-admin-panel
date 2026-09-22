import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import {
  DEVICE_DISPLAY_NAMES,
  DEVICE_LIMITS,
  DEVICE_CONNECTIVITY_VALUE,
  DEVICE_TYPES,
  validatePoleAccessEfforts,
  validateStatusTypesForInaccessiblePhoto,
  type DeviceDisplayName,
} from './EditPole.utils';
import { poleStatusesMap } from '../../MapBox.utils';

// Mock the toast module
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock the MapBox.utils module
vi.mock('../../MapBox.utils', () => ({
  poleStatusesMap: {
    pending: 'pending',
    blocked: 'install blocked',
    'not visible': 'not visible',
    Unblocked: 'unblocked',
  },
}));

describe('EditPole.utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const assertValidResult = (result: any) => {
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(toast.error).not.toHaveBeenCalled();
  };

  const assertValidBooleanResult = (result: boolean) => {
    expect(result).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  };

  const assertInvalidResultWithMessage = (result: boolean, statusType: string) => {
    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      `Please upload a supporting photo when selecting "${statusType.toUpperCase()}" as an inaccessible reason`
    );
  };

  describe('Constants', () => {
    it('should have correct DEVICE_DISPLAY_NAMES values', () => {
      expect(DEVICE_DISPLAY_NAMES).toEqual({
        GRIDSCOPE: 'GRIDSCOPE',
        'WEATHER STATION': 'WEATHER STATION',
      });
    });

    it('should have correct DEVICE_LIMITS values', () => {
      expect(DEVICE_LIMITS).toEqual({
        GRIDSCOPE: 1,
        'WEATHER STATION': 3,
      });
    });

    it('should have correct DEVICE_CONNECTIVITY_VALUE values', () => {
      expect(DEVICE_CONNECTIVITY_VALUE).toEqual({
        Connected: 'Yes',
        'Did not Connect': 'No',
        '': '',
      });
    });

    it('should have DEVICE_TYPES as array of device display names', () => {
      expect(DEVICE_TYPES).toEqual(['GRIDSCOPE', 'WEATHER STATION']);
    });

    it('should properly type DeviceDisplayName', () => {
      const gridscope: DeviceDisplayName = DEVICE_DISPLAY_NAMES.GRIDSCOPE;
      const weatherStation: DeviceDisplayName = DEVICE_DISPLAY_NAMES['WEATHER STATION'];

      expect(gridscope).toBe('GRIDSCOPE');
      expect(weatherStation).toBe('WEATHER STATION');
    });
  });

  describe('validatePoleAccessEfforts', () => {
    it('should return valid when no items are selected', () => {
      const result = validatePoleAccessEfforts([]);
      assertValidResult(result);
    });

    it('should return valid when one item from group1 is selected', () => {
      const result = validatePoleAccessEfforts(['Spoke with Property Owner in Person']);
      assertValidResult(result);
    });

    it('should return valid when one item from group2 is selected', () => {
      const result = validatePoleAccessEfforts(['No Access Info Available']);
      assertValidResult(result);
    });

    it('should return valid when one item from each group is selected', () => {
      const result = validatePoleAccessEfforts(['Spoke with Property Owner in Person', 'No Access Info Available']);
      assertValidResult(result);
    });

    it('should return invalid when multiple items from group1 are selected', () => {
      const selectedItems = ['Spoke with Property Owner in Person', 'Called Property Owner - No Voicemail'];

      const result = validatePoleAccessEfforts(selectedItems);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Only one of the following options can be selected:');
      expect(result.errors[0]).toContain('Spoke with Property Owner in Person');
      expect(result.errors[0]).toContain('Called Property Owner - No Voicemail');
      expect(toast.error).toHaveBeenCalledOnce();
    });

    it('should return invalid when multiple items from group2 are selected', () => {
      const selectedItems = ['No Access Info Available', 'Used Access Info, Did not Work'];

      const result = validatePoleAccessEfforts(selectedItems);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Only one of the following options can be selected:');
      expect(result.errors[0]).toContain('No Access Info Available');
      expect(result.errors[0]).toContain('Used Access Info, Did not Work');
      expect(toast.error).toHaveBeenCalledOnce();
    });

    it('should return invalid when multiple items from both groups are selected', () => {
      const selectedItems = [
        'Spoke with Property Owner in Person',
        'Called Property Owner - No Voicemail',
        'No Access Info Available',
        'Used Access Info, Did not Work',
      ];

      const result = validatePoleAccessEfforts(selectedItems);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(toast.error).toHaveBeenCalledOnce();
    });

    it('should call toast.error with correct structure when validation fails', () => {
      const selectedItems = ['Spoke with Property Owner in Person', 'Called Property Owner - No Voicemail'];

      validatePoleAccessEfforts(selectedItems);

      expect(toast.error).toHaveBeenCalledWith(expect.any(Function));

      // Test the toast function by calling it
      const toastFunction = vi.mocked(toast.error).mock.calls[0][0] as () => JSX.Element;
      const toastElement = toastFunction();

      expect(toastElement.type).toBe('div');
      expect(toastElement.props.className).toBe('flex flex-col');
    });

    it('should handle all group1 items correctly', () => {
      const group1Items = [
        'Spoke with Property Owner in Person',
        'Called Property Owner - No Voicemail',
        'Called Property Owner - Left Voicemail',
        'Called Property Owner - Spoke with Owner',
      ];

      const result = validatePoleAccessEfforts(group1Items);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      for (const item of group1Items) {
        expect(result.errors[0]).toContain(item);
      }
    });

    it('should handle all group2 items correctly', () => {
      const group2Items = ['No Access Info Available', 'Used Access Info, Did not Work'];

      const result = validatePoleAccessEfforts(group2Items);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      for (const item of group2Items) {
        expect(result.errors[0]).toContain(item);
      }
    });

    it('should handle items not in any group correctly', () => {
      const result = validatePoleAccessEfforts(['Some Random Item']);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('validateStatusTypesForInaccessiblePhoto', () => {
    it('should return true when status is not blocked', () => {
      const result = validateStatusTypesForInaccessiblePhoto('pending', 'gated access');
      assertValidBooleanResult(result);
    });

    it('should return true when status is blocked but statusType is not in the restricted list', () => {
      const result = validateStatusTypesForInaccessiblePhoto(poleStatusesMap.blocked, 'some other reason');
      assertValidBooleanResult(result);
    });

    describe('restricted status types', () => {
      const restrictedTypes = ['gated access', 'blocked by vegetation', 'indirect threat (signs)', 'poor insolation'];

      for (const statusType of restrictedTypes) {
        it(`should return false and show error when status is blocked and statusType is "${statusType}"`, () => {
          const result = validateStatusTypesForInaccessiblePhoto(poleStatusesMap.blocked, statusType);
          assertInvalidResultWithMessage(result, statusType);
        });
      }
    });

    describe('case insensitive matching', () => {
      it('should handle case insensitive statusType matching', () => {
        const result = validateStatusTypesForInaccessiblePhoto(poleStatusesMap.blocked, 'GATED ACCESS');
        assertInvalidResultWithMessage(result, 'GATED ACCESS');
      });

      it('should handle mixed case statusType matching', () => {
        const result = validateStatusTypesForInaccessiblePhoto(poleStatusesMap.blocked, 'Blocked By Vegetation');
        assertInvalidResultWithMessage(result, 'Blocked By Vegetation');
      });
    });

    describe('edge cases', () => {
      it.each([
        [undefined, 'undefined'],
        [null, 'null'],
        ['', 'empty string'],
      ])('should handle %s statusType', (statusType, _description) => {
        const result = validateStatusTypesForInaccessiblePhoto(poleStatusesMap.blocked, statusType as any);
        assertValidBooleanResult(result);
      });
    });

    it('should validate all restricted status types', () => {
      const restrictedTypes = ['gated access', 'blocked by vegetation', 'indirect threat (signs)', 'poor insolation'];

      for (const statusType of restrictedTypes) {
        vi.clearAllMocks();
        const result = validateStatusTypesForInaccessiblePhoto(poleStatusesMap.blocked, statusType);

        expect(result).toBe(false);
        expect(toast.error).toHaveBeenCalledOnce();
      }
    });
  });
});
