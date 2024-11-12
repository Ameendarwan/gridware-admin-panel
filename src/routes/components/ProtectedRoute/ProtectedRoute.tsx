import { FC } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Layout from '@app/components/Layout'
import { useSelector } from 'react-redux'
import { urls } from '@app/routes/urls'

const ProtectedRoute: FC = () => {
  const isLoggedIn = useSelector((state: any) => state?.auth?.isLoggedIn)

  if (!isLoggedIn) return <Navigate to={urls.login} />
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default ProtectedRoute
