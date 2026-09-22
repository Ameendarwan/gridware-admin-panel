import { Device } from '../devices/types';

export interface Pole {
  id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
  pole_id: string;
  lat: number;
  long: number;
  status: string;
  status_type: string | null;
  status_reason: string | null;
  suitable_for_install: boolean;
  network_strength: string | null;
  solar_strength: string | null;
  primary_circuit_protective_equipment: boolean;
  surveyor_notes: string | null;
  installation_notes: string | null;
  vegetation_notes: string | null;
  vegetation_condition: string[] | null;
  gate_unlock_mobile_no: string | null;
  gate_unlock_address: string | null;
  gate_unlock_instructions: string | null;
  deployment_id: number;
  enabled_spans_count?: number;
  transmission_configuration: string | null;
  distribution_configuration: string | null;
  equipments: string[];
  access_efforts?: string[];
  is_miscellaneous: boolean;
  is_archived: boolean;
  images: ImageArray;
  is_eppe_complete_v2: boolean;
  has_span_connected?: boolean;
  is_new_pole?: boolean | null;
  installed_at: string | null;
  disabled: boolean;
  devices?: Device[];
  isHighlighted?: boolean;
  label?: string | null;
  status_changed_at?: string;
  status_changed_by?: string;
  last_date_accessed_attempted?: string;
}

export interface CreatePoleResponse {
  message?: string;
  data: Pole;
}

export interface SinglePoleResponse {
  message: string;
  data: Pole;
  success: boolean;
  status_code: number;
}

export type StatusType = Record<string, string[]>;

export interface MiscellaneousResponse {
  data: {
    vegetation: string[];
    equipment: { name: string; label: string }[];
    access_efforts: string[];
    status_info: StatusType;
  };
}

export interface MetaData {
  filename?: string;
  type: string;
  content_type?: string;
}

interface Extra {
  meta_data: MetaData;
  content_type: string;
}

export interface FileData {
  extra: Extra;
  content_path: string | null;
  filename: string;
  content_type: string;
  size: number;
  files: string[];
  width: number;
  height: number;
  file_id: string;
  upload_storage: string;
  uploaded_at: string;
  path: string;
  url: string;
  saved: boolean;
}

export type ImageArray = FileData[] | null;

export enum PoleStatus {
  Pending = 'pending',
  PoleRecordComplete = 'Pole record complete',
  Installed = 'installed',
  Blocked = 'blocked',
  BlockedDevice = 'blocked device',
  RefusedDevice = 'refused device',
  OtherCategory = 'other category',
  NotVisible = 'not visible',
  InstallBlocked = 'install blocked',
}

export enum PoleStatusType {
  GatedAccess = 'gated access',
  BlockedByVegetation = 'blocked by vegetation',
  CustomerRefusal = 'customer refusal',
  TrafficCrewFlaggingNeeded = 'traffic crew flagging needed',
  NeedPermit = 'need permit',
}

export enum VegetationCondition {
  IN_STRIKE_ZONE_OF_PRIMARY_LINES = 'IN STRIKE ZONE OF PRIMARY LINES',
  IN_CONTACT_WITH_COMMUNICATION_LINES = 'IN CONTACT WITH COMMUNICATION LINES',
  IMPACTING_SOLAR_ISOLATION = 'IMPACTING SOLAR ISOLATION',
  NO_VEGETATION = 'NO VEGETATION',
  OTHER = 'OTHER',
}

export enum Strength {
  GOOD = 'GOOD',
  IFFY = 'IFFY',
  BAD = 'BAD',
}

export enum Equipment {
  NONE = 'NONE',
  COMMUNICATION = 'COMMUNICATION',
  CROSSARM = 'CROSSARM',
  GUY_WIRE = 'GUY WIRE',
  SECONDARY_FUSE = 'SECONDARY FUSE',
  TRANSFORMER = 'TRANSFORMER',
  PRIMARY_TAP_FUSE = 'PRIMARY TAP FUSE',
  PRIMARY_INLINE_FUSE = 'PRIMARY INLINE FUSE',
  PRIMARY_RISER = 'PRIMARY RISER',
  PRIMARY_RISER_FUSE = 'PRIMARY RISER FUSE',
  STREETLIGHT = 'STREETLIGHT',
  SECONDARY_LINES = 'SECONDARY LINES',
  PRIMARY_INLINE_SWITCH = 'PRIMARY INLINE SWITCH',
  PRIMARY_TAP_SWITCH = 'PRIMARY TAP SWITCH',
  PRIMARY_RISER_SWITCH = 'PRIMARY RISER SWITCH',
  RECLOSER = 'RECLOSER',
  INLINE_RECLOSER = 'INLINE RECLOSER',
  TAP_RECLOSER = 'TAP RECLOSER',
  VOLTAGE_REGULATOR = 'VOLTAGE REGULATOR',
  CAPACITOR_BANK = 'CAPACITOR BANK',
  CAP_BANK_FUSE = 'CAP BANK FUSE',
  WEATHER_STATION = 'WEATHER STATION',
  WEATHER_STATION_GRIDSCOPE = 'WEATHER STATION GRIDSCOPE',
  UPSTREAM_DEVICE = 'UPSTREAM DEVICE',
  UPSTREAM_POLE = 'UPSTREAM POLE',
  STEEL_POLE = 'STEEL POLE',
  TRANSMISSION_INLINE_FUSE = 'TRANSMISSION INLINE FUSE',
  TRANSMISSION_TAP_FUSE = 'TRANSMISSION TAP FUSE',
  TRANSMISSION_RISER_FUSE = 'TRANSMISSION RISER FUSE',
  TRANSMISSION_INLINE_SWITCH = 'TRANSMISSION INLINE SWITCH',
  TRANSMISSION_TAP_SWITCH = 'TRANSMISSION TAP SWITCH',
  TRANSMISSION_RISER_SWITCH = 'TRANSMISSION RISER SWITCH',
  TRANSMISSION_RISER = 'TRANSMISSION RISER',
  SECONDARY_ONLY = 'SECONDARY ONLY',
  TRANSMISSION_OVERHEAD = 'TRANSMISSION OVERHEAD',
  TRANSMISSION_NEARBY = 'TRANSMISSION NEARBY',
  LIGHTNING_ARRESTOR = 'LIGHTNING ARRESTOR',
}

export enum ImageType {
  Pole = 'pole',
  DeviceSerialNo = 'device_serial_no',
  Vegetation = 'vegetation',
  Miscellaneous = 'misc',
  Installation = 'installation',
  InstallationType = 'installation_type',
  PoleTag = 'pole_tag',
  Inaccessible = 'inaccessible',
}
