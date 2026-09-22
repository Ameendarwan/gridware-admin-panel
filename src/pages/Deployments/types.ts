import { FileData } from '@app/store/apis/pole/types';

export interface DeploymentsProps {
  isMapView: boolean;
}

export enum DeploymentStatus {
  Survey = 'survey',
  Planning = 'planning',
  Installation = 'installation',
  Completion = 'completion',
}

export interface Deployment {
  id: number;
  name: string;
  location: string;
  status: DeploymentStatus;
  json_file: FileData;
  kml_file: FileData;
  customer_id: number;
  users: string[];
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  poles_count: number;
}
