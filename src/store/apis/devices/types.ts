export interface Device {
  id?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  serial_no: string;
  type: string;
  solar_orientation: string;
  description: string;
  is_blinked?: boolean;
  pole_id: number;
  isNew?: boolean;
  disabled?: boolean;
}

export enum OrientationOptions {
  E = 'East',
  SE = 'Southeast',
  S = 'South',
  SW = 'Southwest',
  W = 'West',
}

export enum DeviceTypes {
  GRID_SCOPE='GRIDSCOPE',
  WEATHER_STATION='WEATHER STATION',
}

export interface DeviceResponse {
  message: string;
  data: {
    records: Device[];
    count: number;
  };
}

export interface SingleDeviceResponse {
  message: string;
  data: Device;
}
