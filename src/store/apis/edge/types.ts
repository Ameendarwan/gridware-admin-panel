import { Edge, LineType, SpanT } from '@app/pages/Deployments/components/MapBox/types';

interface Span {
  id: number | undefined;
  line: number | undefined;
  phase: number | undefined;
  type: LineType | undefined;
}

export interface SpanUpdatePayload {
  spans: Span[];
  edge_id?: number | null;
}

export interface EdgesResponse {
  message: string;
  data: {
    records: Edge[];
    count?: number; // Total count of records across all pages
  };
}

export interface SingleEdgeResponse {
  message: string;
  data: Edge;
}

export interface CreateEdgeResponse {
  message?: string;
  data: Edge[];
  error?: { data: { detail: string } };
}

export interface DeleteEdgesResponse {
  message: string;
  error?: { data: { detail: string } };
}

export interface SpansResponse {
  message: string;
  data: { records: SpanT[] };
}
