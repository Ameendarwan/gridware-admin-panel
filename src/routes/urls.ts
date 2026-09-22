export const urls = {
  login: '/',
  dashboard: '/dashboard',
  users: {
    list: '/users',
    create: '/users/create',
    details: '/users/:id/:mode',
  },
  customers: {
    list: '/customers',
    create: '/customers/create',
    details: '/customers/:id/:mode',
  },
  deployments: {
    list: '/deployments',
    create: '/deployments/create',
    details: '/deployments/:id/:mode',
    map: '/deployments/map',
    poleMap: '/deployments/map/:id',
  },
  poles: {
    list: '/poles',
    create: '/poles/create',
    details: '/poles/:id/:mode',
  },
  devices: {
    list: '/devices',
    create: '/devices/create',
    details: '/devices/:id/:mode',
  },
  batchTracking: {
    list: '/batch-tracking',
    details: '/batch-tracking/:id/:mode',
  },
  publicInfoCircuit: {
    list: '/circuit',
    create: '/circuit/create',
    details: '/circuit/:id/:mode',
  },
  csv: {
    list: '/csv',
    create: '/csv/create',
    details: '/csv/:id/:mode',
  },
  spans: {
    list: '/span',
    details: '/span/:id/:mode',
  },
  edge: {
    list: '/edge',
    details: '/edge/:id/:mode',
  },
  bug: {
    list: '/bug',
    create: '/bug/create',
    details: '/bug/:id/:mode',
  },
};
