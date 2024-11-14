import { Route, Routes as DOMRoutes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from '@app/pages/Login';
import Users from '@app/pages/Users';
import MapBox from '@app/components/MapBox';
import NotFound from '@app/pages/NotFound';
import { urls } from './urls';

const Routes = () => (
  <DOMRoutes>
    {/** Authenticated Routes */}
    <Route element={<ProtectedRoute />}>
      <Route path={urls.dashboard} element={<MapBox />} />
      <Route path={urls.users} element={<Users />} />
    </Route>

    {/** Public Routes */}
    <Route path={urls.login} element={<Login />} />
    <Route path="*" element={<NotFound />} />
  </DOMRoutes>
);

export default Routes;
