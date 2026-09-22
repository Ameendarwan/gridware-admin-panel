import { toast } from 'sonner';
import { poleStatusesMap } from '../../MapBox.utils';

export const DEVICE_DISPLAY_NAMES = {
  GRIDSCOPE: 'GRIDSCOPE',
  'WEATHER STATION': 'WEATHER STATION',
};

export const DEVICE_LIMITS = {
  [DEVICE_DISPLAY_NAMES.GRIDSCOPE]: 1,
  [DEVICE_DISPLAY_NAMES['WEATHER STATION']]: 3,
};

export const DEVICE_CONNECTIVITY_VALUE = {
  Connected: 'Yes',
  'Did not Connect': 'No',
  '': '',
};

export const DEVICE_TYPES = Object.values(DEVICE_DISPLAY_NAMES);

export type DeviceDisplayName = (typeof DEVICE_DISPLAY_NAMES)[keyof typeof DEVICE_DISPLAY_NAMES];

export const validatePoleAccessEfforts = (selectedItems: string[]) => {
  const group1 = [
    'Spoke with Property Owner in Person',
    'Called Property Owner - No Voicemail',
    'Called Property Owner - Left Voicemail',
    'Called Property Owner - Spoke with Owner',
  ];

  const group2 = ['No Access Info Available', 'Used Access Info, Did not Work'];

  const group1Selected = selectedItems.filter(item => group1.includes(item));
  const group2Selected = selectedItems.filter(item => group2.includes(item));

  const errors = [] as string[];

  if (group1Selected.length > 1) {
    errors.push(`Only one of the following options can be selected:\n- ${group1.join('\n- ')}`);
  }

  if (group2Selected.length > 1) {
    errors.push(`Only one of the following options can be selected:\n- ${group2.join('\n- ')}`);
  }

  if (errors.length > 0) {
    toast.error(() => (
      <div className="flex flex-col">
        <strong className="mb-2 block">Validation Errors</strong>
        <ul>
          {errors?.map(err => (
            <li key={err}>
              {err.split('\n').map(line => (
                <div key={line}>{line}</div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    ));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateStatusTypesForInaccessiblePhoto = (status: string, statusType: string) => {
  const statusTypes = ['gated access', 'blocked by vegetation', 'indirect threat (signs)', 'poor insolation'];

  const isMatched = status === poleStatusesMap.blocked && statusTypes.includes(statusType?.toLowerCase());

  let isValid = true;

  if (isMatched) {
    isValid = false;
    toast.error(
      `Please upload a supporting photo when selecting "${statusType?.toUpperCase()}" as an inaccessible reason`
    );
  }

  return isValid;
};
