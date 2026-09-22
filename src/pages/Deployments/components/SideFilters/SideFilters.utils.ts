import { Validation, ValidationStageConfig } from '@app/pages/Deployments/components/SideFilters/types';

import { ValidationStages } from '@app/store/slices/polesSlice';

export const validationsTabs: Validation[] = [
  {
    step: 1,
    icon: 'edge',
    tabTitle: 'Stage 1',
    activeColor: 'edge',
    stepTitle: 'Device GQL Checks',
    buttonTitle: 'Run Device GQL Checks',
    nextButtonTitle: 'Go to Stage 2: Upstream Label',
    resolvedText: 'All missing edge checks have been resolved.',
    isCompleted: false,
    checks: [
      {
        id: 'device-not-found',
        title: 'Device Not Found',
        description: 'This GSN isn’t in the Gridware database.',
      },
      {
        id: 'device-already-installed',
        title: 'Device already installed',
        description: 'This GSN is already linked to another pole in the deployment.',
      },
      {
        id: 'outdated-connection',
        title: 'Outdated connection',
        description: 'The device last connected before the install date.',
      },
      {
        id: 'location-mismatch',
        title: 'Location mismatch',
        description: 'Device GPS is over 2+ farther than expected from the pole location.',
      },
    ],
  },
  // {
  //   step: 2,
  //   icon: 'upstream',
  //   tabTitle: 'Stage 2',
  //   activeColor: 'upstream',
  //   stepTitle: 'Missing Spans / Extra Poles Checks',
  //   buttonTitle: 'Run Missing Spans / Extra Poles Checks',
  //   nextButtonTitle: 'Go to Stage 3: Equipment Checks',
  //   resolvedText: 'All Upstream Label checks have been resolved.',
  //   isCompleted: false,
  //   checks: [
  //     {
  //       id: 'edge-missing',
  //       title: 'Edge missing on active pole',
  //       description: 'This pole has a Gridscope but no edge.',
  //     },
  //     {
  //       id: 'unlabeled-unconnected',
  //       title: 'Unlabeled & unconnected',
  //       description: 'This pole has no edge and no nonexistent label.',
  //     },
  //     {
  //       id: 'unmonitored-pole-with-data',
  //       title: 'Unmonitored pole with data',
  //       description:
  //         'This pole has a miscellaneous, nonexistent, or disabled label — but spans or metadata are still present.',
  //     },
  //   ],
  // },
  // {
  //   step: 3,
  //   icon: 'settings',
  //   tabTitle: 'Stage 3',
  //   activeColor: 'equipment',
  //   stepTitle: 'Upstream Label Checks',
  //   buttonTitle: 'Run Upstream Label Checks',
  //   nextButtonTitle: 'Go to Stage 4: Spans',
  //   resolvedText: 'All Equipment Checks have been resolved.',
  //   isCompleted: false,
  //   checks: [
  //     {
  //       id: 'multiple-upstream-poles',
  //       title: 'Multiple upstream poles',
  //       description: 'More than one pole is labeled as an upstream pole.',
  //     },
  //     {
  //       id: 'missing-upstream-pole',
  //       title: 'Missing upstream pole',
  //       description: 'No pole is labeled as the upstream pole.',
  //     },
  //     {
  //       id: 'none-with-other-equipment',
  //       title: '*None* with other equipment',
  //       description: `The ones label can't be used with other equipment labels (except Pink Manual).`,
  //     },
  //     {
  //       id: 'secondary-without-transformer',
  //       title: 'Secondary I/ase without transformer',
  //       description: 'A secondary, just a present without a transformer.',
  //     },
  //     {
  //       id: 'rear-dip-without-riser',
  //       title: 'Rear dip without riser',
  //       description:
  //         'Rear, dip, base three, dip, switch to a reset without primary, alter, dip or transmittance, reset, dip.',
  //     },
  //     {
  //       id: 'capacitor-without-bank',
  //       title: 'Capacitor I/ase without bank',
  //       description: 'cap, bank, just a present without capacitor, bank.',
  //     },
  //     {
  //       id: 'multiple-pole-materials',
  //       title: 'Multiple pole materials',
  //       description: 'More than one pole material is selected (sheet, fiberglass, or concrete).',
  //     },
  //     {
  //       id: 'duplicate-spans',
  //       title: 'Duplicate span',
  //       description: 'Two spans connect the same poles with the same type.',
  //     },
  //   ],
  // },
  // {
  //   step: 4,
  //   icon: 'tab-4-filter',
  //   tabTitle: 'Stage 4',
  //   activeColor: 'span',
  //   stepTitle: 'EPPE Checks',
  //   buttonTitle: 'Run EPPE Checks',
  //   nextButtonTitle: 'Run Final Check',
  //   resolvedText: 'All Span Checks have been resolved.',
  //   finalCheckText: 'Final check completed',
  //   isCompleted: false,
  //   checks: [
  //     {
  //       id: 'missing-required-metadata',
  //       title: 'Missing required metadata',
  //       description: 'This pole has a Gridscope or Blocked status, but required fields are missing.',
  //     },
  //     {
  //       id: 'unexpected-metadata-unmonitored-pole',
  //       title: 'Unexpected metadata on unmonitored pole',
  //       description: 'This unmonitored pole (no Gridscope, no status) has metadata filled.',
  //     },
  //     {
  //       id: 'cpe-on-unmonitored-pole',
  //       title: 'CPE on unmonitored pole',
  //       description: 'This pole has Circuit Protection Equipment but no Gridscope or Blocked status.',
  //     },
  //     {
  //       id: 'blocked-gridscope',
  //       title: 'Blocked/Not Visible pole with Gridscope',
  //       description: 'This pole is marked Blocked or Not Visible but has a Gridscope installed.',
  //     },
  //   ],
  // },
];

export const stageValidationMap: Record<number, ValidationStageConfig> = {
  1: { validationType: ValidationStages.missingEdges, icon: 'marker-missing-edge' },
  // 2: { validationType: ValidationStages.missingUpstream, icon: 'marker-missing-upstream' },
  // 3: { validationType: ValidationStages.missingEquipment, icon: 'marker-missing-equipment' },
  // 4: { validationType: ValidationStages.missingSpans, icon: 'marker-missing-spans' },
};
