import { Issue, ValidationErrorT } from '@app/pages/Deployments/components/SideFilters/types';

export interface ValidationResponse {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  stage: number;
  deployment_id: string;
  status: 'initiated' | 'in_complete' | 'complete' | 'verified';
  issues: Issue[];
}

export interface ValidationPayload {
  deployment: number;
  stage: 1 | 2 | 3 | 4 | 5;
  ignore_issues: string[];
}

export interface ValidateDeploymentResponse {
  message: string;
  task_id: string;
}

export interface ValidationResultsResponse {
  progress_current: number;
  progress_total: number;
  status: 'in_progress' | 'completed' | 'failed';
  task_id: string;
  data?: {
    message: string;
    records?: ValidationErrorT[];
  };
}
