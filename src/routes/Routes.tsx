import { Route, Routes as DOMRoutes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
// import Login from '@app/pages/login'
import Users from '@app/pages/users'
import { urls } from './urls'
import MapBox from '@app/components/MapBox'

const Routes = () => (
  <DOMRoutes>
    {/** Authenticated Routes */}
    <Route element={<ProtectedRoute />}>
      <Route path={urls.dashboard} element={<Users />} />
      <Route path={urls.users} element={<Users />} />
    </Route>

    {/** Public Routes */}
    <Route path={urls.login} element={<MapBox />} />
    <Route path="*" element={<div>404</div>} />
  </DOMRoutes>
)

export default Routes
