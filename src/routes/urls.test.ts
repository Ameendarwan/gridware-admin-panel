import { describe, it, expect } from 'vitest';
import { urls } from './urls';
import { extractAllUrls, validateRoutePattern } from '@app/utils/testHelpers';

describe('urls', () => {
  describe('structure', () => {
    it('should be defined', () => {
      expect(urls).toBeDefined();
      expect(typeof urls).toBe('object');
    });

    it('should not be null', () => {
      expect(urls).not.toBeNull();
    });
  });

  describe('login route', () => {
    it('should have login route', () => {
      expect(urls.login).toBeDefined();
      expect(urls.login).toBe('/');
    });
  });

  describe('dashboard route', () => {
    it('should have dashboard route', () => {
      expect(urls.dashboard).toBeDefined();
      expect(urls.dashboard).toBe('/dashboard');
    });
  });

  describe('users routes', () => {
    it('should have users object', () => {
      expect(urls.users).toBeDefined();
      expect(typeof urls.users).toBe('object');
    });

    it('should have users list route', () => {
      expect(urls.users.list).toBe('/users');
    });

    it('should have users create route', () => {
      expect(urls.users.create).toBe('/users/create');
    });

    it('should have users details route with parameters', () => {
      expect(urls.users.details).toBe('/users/:id/:mode');
    });
  });

  describe('customers routes', () => {
    it('should have customers object', () => {
      expect(urls.customers).toBeDefined();
      expect(typeof urls.customers).toBe('object');
    });

    it('should have customers list route', () => {
      expect(urls.customers.list).toBe('/customers');
    });

    it('should have customers create route', () => {
      expect(urls.customers.create).toBe('/customers/create');
    });

    it('should have customers details route with parameters', () => {
      expect(urls.customers.details).toBe('/customers/:id/:mode');
    });
  });

  describe('deployments routes', () => {
    it('should have deployments object', () => {
      expect(urls.deployments).toBeDefined();
      expect(typeof urls.deployments).toBe('object');
    });

    it('should have deployments list route', () => {
      expect(urls.deployments.list).toBe('/deployments');
    });

    it('should have deployments create route', () => {
      expect(urls.deployments.create).toBe('/deployments/create');
    });

    it('should have deployments details route with parameters', () => {
      expect(urls.deployments.details).toBe('/deployments/:id/:mode');
    });

    it('should have deployments map route', () => {
      expect(urls.deployments.map).toBe('/deployments/map');
    });

    it('should have deployments pole map route with parameter', () => {
      expect(urls.deployments.poleMap).toBe('/deployments/map/:id');
    });
  });

  describe('poles routes', () => {
    it('should have poles object', () => {
      expect(urls.poles).toBeDefined();
      expect(typeof urls.poles).toBe('object');
    });

    it('should have poles list route', () => {
      expect(urls.poles.list).toBe('/poles');
    });

    it('should have poles create route', () => {
      expect(urls.poles.create).toBe('/poles/create');
    });

    it('should have poles details route with parameters', () => {
      expect(urls.poles.details).toBe('/poles/:id/:mode');
    });
  });

  describe('devices routes', () => {
    it('should have devices object', () => {
      expect(urls.devices).toBeDefined();
      expect(typeof urls.devices).toBe('object');
    });

    it('should have devices list route', () => {
      expect(urls.devices.list).toBe('/devices');
    });

    it('should have devices create route', () => {
      expect(urls.devices.create).toBe('/devices/create');
    });

    it('should have devices details route with parameters', () => {
      expect(urls.devices.details).toBe('/devices/:id/:mode');
    });
  });

  describe('batchTracking routes', () => {
    it('should have batchTracking object', () => {
      expect(urls.batchTracking).toBeDefined();
      expect(typeof urls.batchTracking).toBe('object');
    });

    it('should have batchTracking list route', () => {
      expect(urls.batchTracking.list).toBe('/batch-tracking');
    });

    it('should have batchTracking details route with parameters', () => {
      expect(urls.batchTracking.details).toBe('/batch-tracking/:id/:mode');
    });
  });

  describe('publicInfoCircuit routes', () => {
    it('should have publicInfoCircuit object', () => {
      expect(urls.publicInfoCircuit).toBeDefined();
      expect(typeof urls.publicInfoCircuit).toBe('object');
    });

    it('should have publicInfoCircuit list route', () => {
      expect(urls.publicInfoCircuit.list).toBe('/circuit');
    });

    it('should have publicInfoCircuit create route', () => {
      expect(urls.publicInfoCircuit.create).toBe('/circuit/create');
    });

    it('should have publicInfoCircuit details route with parameters', () => {
      expect(urls.publicInfoCircuit.details).toBe('/circuit/:id/:mode');
    });
  });

  describe('csv routes', () => {
    it('should have csv object', () => {
      expect(urls.csv).toBeDefined();
      expect(typeof urls.csv).toBe('object');
    });

    it('should have csv list route', () => {
      expect(urls.csv.list).toBe('/csv');
    });

    it('should have csv create route', () => {
      expect(urls.csv.create).toBe('/csv/create');
    });

    it('should have csv details route with parameters', () => {
      expect(urls.csv.details).toBe('/csv/:id/:mode');
    });
  });

  describe('spans routes', () => {
    it('should have spans object', () => {
      expect(urls.spans).toBeDefined();
      expect(typeof urls.spans).toBe('object');
    });

    it('should have spans list route', () => {
      expect(urls.spans.list).toBe('/span');
    });

    it('should have spans details route with parameters', () => {
      expect(urls.spans.details).toBe('/span/:id/:mode');
    });
  });

  describe('edge routes', () => {
    it('should have edge object', () => {
      expect(urls.edge).toBeDefined();
      expect(typeof urls.edge).toBe('object');
    });

    it('should have edge list route', () => {
      expect(urls.edge.list).toBe('/edge');
    });

    it('should have edge details route with parameters', () => {
      expect(urls.edge.details).toBe('/edge/:id/:mode');
    });
  });

  describe('bug routes', () => {
    it('should have bug object', () => {
      expect(urls.bug).toBeDefined();
      expect(typeof urls.bug).toBe('object');
    });

    it('should have bug list route', () => {
      expect(urls.bug.list).toBe('/bug');
    });

    it('should have bug create route', () => {
      expect(urls.bug.create).toBe('/bug/create');
    });

    it('should have bug details route with parameters', () => {
      expect(urls.bug.details).toBe('/bug/:id/:mode');
    });
  });

  describe('route patterns', () => {
    it('should have consistent parameter patterns for details routes', () => {
      const detailsRoutes = [
        urls.users.details,
        urls.customers.details,
        urls.deployments.details,
        urls.poles.details,
        urls.devices.details,
        urls.batchTracking.details,
        urls.publicInfoCircuit.details,
        urls.csv.details,
        urls.spans.details,
        urls.edge.details,
        urls.bug.details,
      ];

      for (const route of detailsRoutes) {
        expect(route).toMatch(/:id\/:mode$/);
      }
    });

    it('should have consistent create route patterns', () => {
      const createRoutes = [
        urls.users.create,
        urls.customers.create,
        urls.deployments.create,
        urls.poles.create,
        urls.devices.create,
        urls.publicInfoCircuit.create,
        urls.csv.create,
        urls.bug.create,
      ];

      for (const route of createRoutes) {
        expect(route).toMatch(/\/create$/);
      }
    });

    it('should have all list routes without parameters', () => {
      const listRoutes = [
        urls.users.list,
        urls.customers.list,
        urls.deployments.list,
        urls.poles.list,
        urls.devices.list,
        urls.batchTracking.list,
        urls.publicInfoCircuit.list,
        urls.csv.list,
        urls.spans.list,
        urls.edge.list,
        urls.bug.list,
      ];

      for (const route of listRoutes) {
        expect(route).not.toMatch(/:/);
      }
    });
  });

  describe('route validation', () => {
    it('should have all routes start with forward slash', () => {
      const allRoutes = extractAllUrls(urls);
      validateRoutePattern(allRoutes, /^\//);
    });

    it('should not have trailing slashes except for root', () => {
      const allRoutes = extractAllUrls(urls, ['login']); // exclude root route
      validateRoutePattern(allRoutes, /\/$/, false);
    });
  });
});
