import { Route, Routes as DOMRoutes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from '@app/pages/login'
import Users from '@app/pages/users'
import { urls } from './urls'

const Routes = () => (
  <DOMRoutes>
    {/** Authenticated Routes */}
    <Route element={<ProtectedRoute />}>
      <Route path={urls.users} element={<Users />} />
    </Route>

    {/** Public Routes */}
    <Route path={urls.login} element={<Login />} />
    <Route path="*" element={<div>404</div>} />
  </DOMRoutes>
)

export default Routes
