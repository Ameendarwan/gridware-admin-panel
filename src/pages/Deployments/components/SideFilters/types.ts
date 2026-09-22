import { IconNames } from '@app/components/SVGIcon/SVGIcon.utils';
import { ValidationStages } from '@app/store/slices/polesSlice';

export interface EquipmentCardProps {
  id: string;
  labels: {
    upstream: string;
    installation: string;
  };
}

export interface SpanCardProps {
  upstream: {
    color: string;
    label: string;
  }[];
  downstream: {
    color: string;
    label: string;
  }[];
}

export interface Validation {
  step: number;
  icon: IconNames;
  tabTitle: string;
  activeColor: string;
  stepTitle: string;
  buttonTitle?: string;
  nextButtonTitle?: string;
  resolvedText?: string;
  finalCheckText?: string;
  isCompleted?: boolean;
  checks?: {
    id: string;
    title: string;
    description: string;
  }[];
}

export type IssueClassifier = 'missing_gps_info' | 'location_discrepancy';
export type IssueEntity = 'pole' | 'device';

export type Issue = {
  id: string;
  entity: IssueEntity;
  classifier?: IssueClassifier;
  ids: number[];
  hint: string;
  error: string;
  is_warning: boolean;
  isIgnored?: boolean;
  title?: string;
  coordinates?: {
    lat: number;
    long: number;
    aggregated_device_latitude?: number;
    aggregated_device_longitude?: number;
  };
};

export type Ignore = {
  state: boolean;
  by: string | null;
};

export type ValidationErrorT = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  stage: number;
  deployment_id: string;
  status: 'initiated' | 'in_complete' | 'complete' | 'verified';
  issues: Issue[];
};

export interface ValidationStageConfig {
  validationType: ValidationStages;
  icon: IconNames;
}
