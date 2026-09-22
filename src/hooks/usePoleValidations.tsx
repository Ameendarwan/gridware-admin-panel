import { Pole } from '@app/store/apis/pole/types';
import { toast } from 'sonner';

export enum PoleStatus {
  Installed = 'installed',
  InstallBlocked = 'install blocked',
  NotVisible = 'not visible',
  Pending = 'pending',
  UnBlocked = 'UnBlocked',
}

interface PoleValidation {
  isValid: boolean;
  effectiveStatus: PoleStatus;
  hasMinimalDeviceData: boolean;
  errorType?: 'downgrade' | 'upgrade';
}

export const validatePole = (pole: Pole, originalStatus: PoleStatus): PoleValidation => {
  const { status, devices = [] } = pole;

  const hasMinimalDeviceData = devices.some(
    device => device.serial_no && device.solar_orientation !== undefined && device?.is_blinked !== undefined
  );

  const shouldUpgradeToInstalled =
    [PoleStatus.Pending, PoleStatus.InstallBlocked, PoleStatus.NotVisible].includes(originalStatus) &&
    hasMinimalDeviceData;

  let effectiveStatus: PoleStatus = status as PoleStatus;

  // Rule 1: If pole is pending / blocked / not visible AND device with minimal data added → installed
  if (shouldUpgradeToInstalled) {
    effectiveStatus = PoleStatus.Installed;
  }

  // Rule 2: If device is removed, revert to pending
  if (devices.length === 0) {
    effectiveStatus = PoleStatus.Pending;
  }

  // Rule 3: Block user from setting status to install-blocked or not visible if device is present
  if (
    [PoleStatus.InstallBlocked, PoleStatus.NotVisible, PoleStatus.Pending].includes(status as PoleStatus) &&
    devices.length > 0
  ) {
    toast.error('Poles with Gridscopes cannot be Blocked or Non-Visible. Remove devices before changing status.');
    return {
      isValid: false,
      effectiveStatus: originalStatus,
      hasMinimalDeviceData,
      errorType: 'downgrade',
    };
  }

  return {
    isValid: true,
    effectiveStatus,
    hasMinimalDeviceData,
  };
};
