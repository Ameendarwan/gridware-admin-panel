import { vi } from 'vitest';

/**
 * Common mock data factories to reduce code duplication across test files
 */

// Factory for creating mock poles
export const createMockPole = (overrides = {}) => {
  return {
    id: 1,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    created_by: 'test-user',
    updated_by: null,
    pole_id: 'POLE-001',
    lat: 40.7128,
    long: -74.006,
    status: 'active',
    searchTerm: '',
    status_type: null,
    status_reason: null,
    suitable_for_install: true,
    network_strength: null,
    solar_strength: null,
    primary_circuit_protective_equipment: false,
    surveyor_notes: null,
    installation_notes: null,
    vegetation_notes: null,
    vegetation_condition: null,
    gate_unlock_mobile_no: null,
    gate_unlock_address: null,
    gate_unlock_instructions: null,
    deployment_id: 1,
    enabled_spans_count: 0,
    transmission_configuration: null,
    distribution_configuration: null,
    equipments: [],
    is_miscellaneous: false,
    is_archived: false,
    images: [],
    is_eppe_complete_v2: false,
    has_span_connected: false,
    is_new_pole: null,
    installed_at: null,
    disabled: false,
    devices: [],
    ...overrides,
  };
};

// Factory for creating mock devices
export const createMockDevice = (overrides = {}) => {
  return {
    id: 1,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    created_by: 'test-user',
    updated_by: undefined,
    serial_no: 'DEV-001',
    type: 'sensor',
    solar_orientation: 'South',
    description: 'Test device',
    is_blinked: false,
    pole_id: 1,
    isNew: false,
    disabled: false,
    ...overrides,
  };
};

// Factory for creating mock table columns
export const createMockTableColumn = (overrides = {}) => {
  return {
    id: 'col1',
    accessorFn: () => {},
    getCanHide: () => true,
    getIsVisible: () => true,
    toggleVisibility: vi.fn(),
    columnDef: { label: 'Column 1' },
    ...overrides,
  };
};
