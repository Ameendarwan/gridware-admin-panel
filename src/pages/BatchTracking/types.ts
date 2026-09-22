export interface BatchTrackingFormValues {
  id: string;
  data_type?: string;
  is_completed?: boolean;
  total?: number;
  data?: Record<string, unknown>;
  request_data?: Array<Record<string, unknown>>;
  errors?: Array<Record<string, unknown>>;
  requested_by?: string;
  created_at?: string;
  updated_at?: string;
}
