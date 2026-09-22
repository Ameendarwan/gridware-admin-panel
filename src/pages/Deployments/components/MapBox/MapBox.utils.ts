import * as turf from '@turf/turf';

import { EdgesMap, LineType, LineTypeKey, lineColors } from '@app/pages/Deployments/components/MapBox/types';
import { ICON_NAMES, IconNames, IconProps, icons } from '@app/components/SVGIcon/SVGIcon.utils';

import { MapRef } from 'react-map-gl';
import { Pole } from '@app/store/apis/pole/types';
import ReactDOMServer from 'react-dom/server';

export const poleStatusesMap = {
  pending: 'pending',
  blocked: 'install blocked',
  'not visible': 'not visible',
  Unblocked: 'unblocked',
};

export const poleStatuses = [
  { value: poleStatusesMap.pending, label: 'No Status' },
  { value: poleStatusesMap.blocked, label: 'Install-Blocked' },
  { value: poleStatusesMap['not visible'], label: 'Not Visible' },
  { value: poleStatusesMap.Unblocked, label: 'Unblocked' },
];

export const poleStatusesListView = [
  { value: poleStatusesMap.pending, label: 'Pending' },
  { value: 'installed', label: 'Installed' },
  { value: poleStatusesMap['not visible'], label: 'Not Visible' },
  { value: poleStatusesMap.blocked, label: 'Install-Blocked' },
  { value: poleStatusesMap.Unblocked, label: 'Unblocked' },
  { value: 'unmonitored', label: 'Unmonitored' },
];

export const poleStatusTypes = [
  { value: 'gated access', label: 'Gated Access' },
  { value: 'blocked by vegetation', label: 'Blocked by Vegetation' },
  { value: 'customer refusal', label: 'Customer Refusal' },
  { value: 'traffic crew flagging needed', label: 'Traffic Crew Flagging Needed' },
  { value: 'need permit', label: 'Need Permit' },
  { value: 'safety concern', label: 'Safety Concern' },
];

export const fuseData = [
  {
    label: 'Fuse 1',
    indicators: [
      { number: '2', code: 'P-2.3', color: 'bg-[#3DB0DE]' },
      { number: '1', code: 'P-3.3', color: 'bg-[#A83DDE]' },
    ],
  },
  {
    label: 'Fuse 2',
    indicators: [{ number: '1', code: 'P-1.1', color: 'bg-[#DE3D82]' }],
  },
];

export const poleLabelOptionsForCreate = ['NONE', 'MISCELLANEOUS'];
export const poleLabelOptionsForEdit = ['NONE', 'NON EXISTENT', 'DISABLED', 'MISCELLANEOUS'];

export const poleDeviceTypes = ['GRIDSCOPE', 'WEATHER STATION', 'LORA GATEWAY'];

export const solarIsolationOptions = ['GOOD', 'IFFY', 'BAD'];

export const poleImageTypes = [
  { value: 'pole', label: 'Pole' },
  { value: 'device_serial_no', label: 'Device Serial No' },
  { value: 'vegetation', label: 'Vegetation' },
  { value: 'misc', label: 'Miscellaneous' },
  { value: 'installation', label: 'Installation' },
  { value: 'installation_type', label: 'Installation Type' },
  { value: 'pole_tag', label: 'Pole Tag' },
  { value: 'inaccessible', label: 'Inaccessible' },
];

export const createOffsetLine = (coordinates: [number, number][], offsetIndex: number): [number, number][] => {
  const [start, end] = coordinates;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const length = Math.hypot(dx, dy);
  const unitPerpX = -dy / length;
  const unitPerpY = dx / length;
  const offsetDistance = (offsetIndex - 1) * 0.00001;
  return [
    [start[0] + unitPerpX * offsetDistance, start[1] + unitPerpY * offsetDistance],
    [end[0] + unitPerpX * offsetDistance, end[1] + unitPerpY * offsetDistance],
  ];
};

export const getLineStyles = (isEdgeSelected?: boolean) => ({
  lineWidth: isEdgeSelected ? 10 : 7,
  lineOpacity: isEdgeSelected ? 1 : 0.5,
});

export const calculateLineMidpoint = (coordinates: number[][]): [number, number] | null => {
  if (!coordinates || coordinates.length < 2) return null;

  const midIndex = Math.floor(coordinates.length / 2);
  const point1 = coordinates[midIndex - 1];
  const point2 = coordinates[midIndex];

  if (point1 && point2 && point1.length === 2 && point2.length === 2) {
    return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
  }

  return null;
};

/**
 * Calculates the marker size based on the zoom level.
 *
 * The marker size scales exponentially with the zoom level.
 * For zoom levels above certain thresholds, a higher growth factor is applied.
 *
 * @param debouncedZoom - The current (debounced) zoom level.
 * @returns The computed marker size.
 */
export const getMarkerSize = (debouncedZoom: number): number => {
  const BASE_SIZE = 20;
  const DEFAULT_GROWTH_FACTOR = 1.24;
  const GROWTH_FACTOR_FOR_ZOOM_PLUS = 1.28;
  const BASE_ZOOM = 14;
  let growthFactor: number;
  if (debouncedZoom > 20) {
    growthFactor = GROWTH_FACTOR_FOR_ZOOM_PLUS;
  } else {
    growthFactor = DEFAULT_GROWTH_FACTOR;
  }
  // Calculate the number of steps from the base zoom level.
  const zoomSteps = debouncedZoom - BASE_ZOOM;
  // Calculate the marker size based on exponential growth.
  const calculatedSize = BASE_SIZE * Math.pow(growthFactor, zoomSteps);
  // Ensure the marker size is never smaller than the base size.
  return Math.max(BASE_SIZE, calculatedSize);
};

export const getSelectedEdgeDetails = (edgesMap: EdgesMap, selectedEdgeId: number) => {
  const selectedEdge = edgesMap[selectedEdgeId];
  const primaryLines = selectedEdge?.primaryLines?.map(pLine => `P-${pLine.phase}.${pLine.line}`);
  const transmissionLines = selectedEdge?.transmissionLines?.map(pLine => `T-${pLine.phase}.${pLine.line}`);
  const combinedLines = [...(primaryLines ?? []), ...(transmissionLines ?? [])].join(' ');
  return { selectedEdge, combinedLines };
};

export const getSelectedPoleEdgeIds = (edgesMap: EdgesMap, selectedPoleId: number) => {
  const edgeIds = [];

  for (const [key, value] of Object.entries(edgesMap)) {
    // Check if the poleId is in either from_pole_id or to_pole_id
    if (value.from_pole_id === selectedPoleId || value.to_pole_id === selectedPoleId) {
      edgeIds.push(Number(key)); // Add the key to the result array
    }
  }
  return edgeIds;
};

const containsEquipment = (pole: Pole, equipment: string) =>
  pole?.equipments?.some(e => e.toLowerCase().includes(equipment.toLowerCase()));

const applyEquipmentModifiers = (iconName: IconNames, pole: Pole): IconNames => {
  let updatedIconName = iconName;
  if (containsEquipment(pole, 'UPSTREAM DEVICE') && containsEquipment(pole, 'UPSTREAM POLE')) {
    updatedIconName = `${updatedIconName}-upstream-pole-device` as IconNames;
  } else if (containsEquipment(pole, 'UPSTREAM DEVICE') || containsEquipment(pole, 'UPSTREAM POLE')) {
    updatedIconName = `${updatedIconName}-upstream-device` as IconNames;
  }

  if (containsEquipment(pole, 'Riser')) {
    updatedIconName = `${updatedIconName}-riser` as IconNames;
  }

  return updatedIconName;
};

const applyModifiers = (iconName: IconNames, pole: Pole): IconNames => {
  let updatedIconName = iconName;
  updatedIconName = applyEquipmentModifiers(updatedIconName, pole);
  return updatedIconName;
};

const getFallbackIconName = (iconName: IconNames): IconNames => {
  const ICON_FALLBACKS = new Map([
    ['blocked', 'marker-blocked'],
    ['not visible', 'marker-not-visible'],
    ['miscellaneous', 'marker-miscellaneous'],
    ['non existent', 'marker-nonexistent'],
  ]);

  if (Object.values<IconNames>(ICON_NAMES).includes(iconName)) {
    return iconName;
  }

  const fallback = [...ICON_FALLBACKS.entries()].find(([key]) => iconName?.toLowerCase().includes(key))?.[1];

  return (fallback ?? 'marker-no-metadata') as IconNames;
};

export const getPoleMarkerName = (pole: Pole): IconNames => {
  let iconName: IconNames = 'marker-no-metadata';

  if (pole?.status?.toLowerCase() === 'unmonitored') {
    iconName = 'marker-unmonitored';
    iconName = applyModifiers(iconName, pole);
  }

  if (
    pole?.status?.toLowerCase() === 'installed' &&
    pole?.devices?.some(device => device?.type?.toLowerCase().includes('gridscope'))
  ) {
    iconName = 'marker-gs';
    iconName = applyModifiers(iconName, pole);
  }
  if (
    pole?.status?.toLowerCase() === 'installed' &&
    pole?.devices?.some(device => device?.type?.toLowerCase().includes('weather station'))
  ) {
    iconName = 'marker-weather-station';
    iconName = applyModifiers(iconName, pole);
  }

  if (pole?.status?.toLowerCase() === 'not visible') {
    iconName = 'marker-not-visible';
  }

  if (pole?.status?.toLowerCase().includes('blocked')) {
    iconName = 'marker-blocked';
    iconName = applyModifiers(iconName, pole);
  }

  if (pole?.status?.toLowerCase().includes('unblocked')) {
    iconName = 'marker-unblocked';
  }

  if (pole?.is_miscellaneous || pole?.is_archived) {
    iconName = 'marker-miscellaneous';
  }
  if (pole?.disabled) {
    iconName = 'marker-nonexistent';
  }

  // Ensure the iconName is a valid IconNames value
  iconName = getFallbackIconName(iconName);

  return iconName;
};

export const handleOpenGoogleMap = (lat: number, long: number) => {
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${long}`;
  globalThis.open(googleMapsUrl, '_blank');
};

export const getLineColor = (phase?: number, line?: number) => {
  return `${phase}.${line}` in lineColors ? lineColors[`${phase}.${line}`] : '#686868';
};

// Utility function to convert a React component to a base64-encoded data URL
const svgToDataUrl = (iconComponent: any, props: Partial<IconProps>) => {
  const svgString = ReactDOMServer.renderToStaticMarkup(iconComponent(props));
  const encodedSvg = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=UTF-8,${encodedSvg}`;
};

export const addAllImagesToMap = (mapRef: MapRef, uniqueIcons: IconNames[], markerSize: number) => {
  const map = mapRef.getMap();
  const additionalIcons: IconNames[] = [
    'marker-selected-pole',
    'marker-missing-edge',
    'marker-missing-upstream',
    'marker-missing-equipment',
    'marker-missing-spans',
  ];

  const loadIcons = () => {
    for (const iconName of [...uniqueIcons, ...additionalIcons]) {
      const svgUrl = svgToDataUrl(icons[iconName], { width: markerSize, height: markerSize });
      const image = new Image();
      image.src = svgUrl;
      image.width = markerSize;
      image.height = markerSize;
      image.onload = () => {
        if (mapRef.hasImage(iconName)) {
          mapRef.removeImage(iconName);
        }
        mapRef.addImage(iconName, image);
      };
      image.onerror = error => {
        console.error(`Error loading image for icon ${iconName}:`, error);
      };
    }
  };
  map.on('style.load', loadIcons);
  loadIcons();
};

export const errorToastDuration = 8000;

export const mapStyles = [
  { id: 'outdoors-v12', name: 'Outdoor' },
  { id: 'satellite-streets-v12', name: 'Satellite' },
  { id: 'navigation-day-v1', name: 'Navigation' },
];

export const getLineTypeByKey = (value: string) => {
  return Object.entries(LineTypeKey).find(([_, v]) => v === value)?.[0] as LineType;
};

export const createCircle = (lon: number, lat: number) => {
  return turf.circle([lon, lat], 0.1, {
    steps: 64,
    units: 'kilometers',
  });
};

export const markerShadowLayer = {
  id: 'marker-shadow',
  type: 'fill',
  paint: {
    'fill-color': '#628FEE',
    'fill-opacity': 0.39,
  },
};
