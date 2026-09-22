export interface ImportToProductionDialogProps {
  deploymentId?: string;
  deploymentName?: string;
  exportData?: any;
  className?: string;
}

export type ImportStatus = 'confirm' | 'loading' | 'complete' | 'failed';

export interface ImportSummary {
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
}
