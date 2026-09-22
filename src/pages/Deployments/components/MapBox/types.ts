export enum MapMode {
  NOVIEW = 'NOVIEW',
  POLEVIEW = 'POLEVIEW',
  POLEEDIT = 'POLEEDIT',
  POLEADD = 'POLEADD',
  EDGEVIEW = 'EDGEVIEW',
  EDGEEDIT = 'EDGEEDIT',
  CREATEEDGE = 'CREATEEDGE',
}

export const lineColors: { [key: string]: string } = {
  '1.1': '#DE3D82',
  '1.2': '#DE783D',
  '1.3': '#DEC03D',
  '2.2': '#34AE1C',
  '2.3': '#3DB0DE',
  '2.4': '#503DDE',
  '3.3': '#A83DDE',
  '3.4': '#EA6BDB',
  '3.5': '#975152',
  secondary: '#686868',
};

export enum LineType {
  Transmission = 'Transmission',
  Primary = 'Primary',
  Secondary = 'Secondary',
}

export enum LineTypeKey {
  Transmission = 'T',
  Primary = 'P',
  Secondary = 'S',
}

export interface LineConfig {
  phase?: number;
  line?: number;
  id?: number;
  edgeId?: number;
}

export interface LineData {
  type: LineType;
  config: LineConfig | null;
  coordinates: [number, number][];
}

export interface SpanT {
  id?: number;
  type?: LineType;
  value?: boolean;
  color?: string;
  phase?: number;
  line?: number;
  selected?: boolean;
  isDisabled?: boolean;
  isNew?: boolean;
  association_id?: number;
}

export interface Edge {
  id: number;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
  deployment_id: number;
  from_pole_id: number;
  to_pole_id: number;
  color?: string;
  span_id?: number[];
  spans?: SpanT[];
  selected_spans?: SpanT[];
  isNew?: boolean;
  coordinates?: [number, number][];
}

export type EdgesMap = { [key: number]: EdgeSpans };

export interface EdgeSpans extends Edge {
  primaryLines?: SpanT[];
  transmissionLines?: SpanT[];
  secondaryLine?: SpanT | null;
}

export interface EdgeGroup extends Edge {
  lines: LineData[];
}

export interface Layer {
  coordinates: [number, number];
  features: any[];
}
