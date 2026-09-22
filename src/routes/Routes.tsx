import { Routes as DOMRoutes, Outlet, Route } from 'react-router-dom';

import BatchTracking from '@app/pages/BatchTracking';
import BatchTrackingDetails from '@app/pages/BatchTracking/components/BatchTrackingDetails';
import Bug from '@app/pages/Bug';
import BugDetails from '@app/pages/Bug/components/BugDetails';
import CsvPage from '@app/pages/CSV';
import CSVDetails from '@app/pages/CSV/components/CSVDetails';
import CustomerDetails from '@app/pages/Customers/components/CustomerDetails';
import Customers from '@app/pages/Customers';
import DeploymentDetails from '@app/pages/Deployments/components/DeploymentDetails';
import Deployments from '@app/pages/Deployments';
import DeviceDetails from '@app/pages/Devices/components/DeviceDetails';
import Devices from '@app/pages/Devices';
import Edges from '@app/pages/Edges';
import Login from '@app/pages/Login';
import NotFound from '@app/pages/NotFound';
import PoleDetails from '@app/pages/Poles/components/PoleDetails';
import Poles from '@app/pages/Poles';
import ProtectedRoute from './components/ProtectedRoute';
import PublicInfoCircuit from '@app/pages/PublicInfoCircuit';
import PublicInfoCircuitDetails from '@app/pages/PublicInfoCircuit/components/PublicInfoCircuitDetails';
import Spans from '@app/pages/Spans';
import UserDetails from '@app/pages/Users/components/UserDetails';
import Users from '@app/pages/Users';
import { urls } from './urls';

const Routes = () => (
  <DOMRoutes>
    {/** Authenticated Routes */}
    <Route element={<ProtectedRoute />}>
      {/* Users */}
      <Route path={urls.users.list} element={<Outlet />}>
        <Route index element={<Users />} />
        <Route path={urls.users.create} element={<UserDetails />} />
        <Route path={urls.users.details} element={<UserDetails />} />
      </Route>

      {/* Customers */}
      <Route path={urls.customers.list} element={<Outlet />}>
        <Route index element={<Customers />} />
        <Route path={urls.customers.create} element={<CustomerDetails />} />
        <Route path={urls.customers.details} element={<CustomerDetails />} />
      </Route>

      {/* Deployments */}
      <Route path={urls.deployments.list} element={<Outlet />}>
        <Route index element={<Deployments isMapView={false} />} />
        <Route path={urls.deployments.map} element={<Deployments isMapView={true} />} />
        <Route path={urls.deployments.poleMap} element={<Deployments isMapView={true} />} />
        <Route path={urls.deployments.create} element={<DeploymentDetails />} />
        <Route path={urls.deployments.details} element={<DeploymentDetails />} />
      </Route>

      {/* Public Info Circuit */}
      <Route path={urls.publicInfoCircuit.list} element={<Outlet />}>
        <Route index element={<PublicInfoCircuit />} />
        <Route path={urls.publicInfoCircuit.create} element={<PublicInfoCircuitDetails />} />
        <Route path={urls.publicInfoCircuit.details} element={<PublicInfoCircuitDetails />} />
      </Route>

      {/* Devices */}
      <Route path={urls.devices.list} element={<Outlet />}>
        <Route index element={<Devices />} />
        <Route path={urls.devices.create} element={<DeviceDetails />} />
        <Route path={urls.devices.details} element={<DeviceDetails />} />
      </Route>

      {/* CSV */}
      <Route path={urls.csv.list} element={<Outlet />}>
        <Route index element={<CsvPage />} />
        <Route path={urls.csv.create} element={<CSVDetails />} />
        <Route path={urls.csv.details} element={<CSVDetails />} />
      </Route>

      {/* Spans */}
      <Route path={urls.spans.list} element={<Outlet />}>
        <Route index element={<Spans />} />
      </Route>

      {/* Edges */}
      <Route path={urls.edge.list} element={<Outlet />}>
        <Route index element={<Edges />} />
      </Route>

      {/* Poles */}
      <Route path={urls.poles.list} element={<Outlet />}>
        <Route index element={<Poles />} />
        <Route path={urls.poles.create} element={<PoleDetails />} />
        <Route path={urls.poles.details} element={<PoleDetails />} />
      </Route>

      {/* Batch Tracking */}
      <Route path={urls.batchTracking.list} element={<Outlet />}>
        <Route index element={<BatchTracking />} />
        <Route path={urls.batchTracking.details} element={<BatchTrackingDetails />} />
      </Route>

      {/* Bug */}
      <Route path={urls.bug.list} element={<Outlet />}>
        <Route index element={<Bug />} />
        <Route path={urls.bug.details} element={<BugDetails />} />
      </Route>
    </Route>

    {/** Public Routes */}
    <Route path={urls.login} element={<Login />} />
    <Route path="*" element={<NotFound />} />
  </DOMRoutes>
);

export default Routes;
