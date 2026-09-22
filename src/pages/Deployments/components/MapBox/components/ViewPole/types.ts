import { Pole } from '@app/store/apis/pole/types';

export interface DividerProps {
  className?: string;
}

export interface EquipmentItemProps {
  label: string;
}

export interface SectionHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export interface DeviceProps {
  id: string;
  direction: string;
  isFastBlink: boolean;
}

export interface EdgeItemProps {
  type: string;
  connections: string[];
}

export interface ViewPoleProps {
  pole: Pole | null;
  handleEditPole: () => void;
}
