import { Route, Routes as DOMRoutes } from 'react-router-dom'
import { urls } from './urls'

const Routes = () => (
  <DOMRoutes>
    {/** Authenticated Routes */}
    <Route path={urls.home} element={<div>Home</div>} />

    {/** Public Routes */}
    <Route path="*" element={<div>404</div>} />
  </DOMRoutes>
)

export default Routes
