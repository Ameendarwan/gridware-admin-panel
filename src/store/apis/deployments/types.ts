import { Deployment } from '@app/pages/Deployments/types';
import { Pole } from '../pole/types';

export interface PolesResponse {
  message: string;
  data: Pole[];
}

export interface DeploymentsResponse {
  message: string;
  data: Deployment;
}

export interface CreatePoleResponse {
  message?: string;
  data: Pole;
}

export interface ExportDeploymentFileResponse {
  data: any;
  filename: string;
}

export interface ExportDeploymentWarningsResponse {
  success: boolean;
  warnings: string[];
  has_warnings: boolean;
  warning_count: number;
  message: string;
}

export interface ExportGQLResponse {
  status: number;
  message: string;
  data: {
    warnings: string[];
    errors: string[];
    poles_created: string[];
    poles_updated: string[];
    poles_skipped: string[];
    device_installs_created: string[];
    device_installs_skipped: string[];
    pole_neighbors_created: number;
    pole_neighbors_skipped: number;
    pole_equipment_updated: string[];
    pole_equipment_skipped: string[];
    photos_uploaded: string[];
    photos_skipped: string[];
  };
}
