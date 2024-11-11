import { FC } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import './globals.css'
import Layout from '@/components/Layout/Layout'
import Users from './pages/users/Users'

const App: FC = _props => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Layout>
          <Users />
        </Layout>
      </BrowserRouter>
    </Provider>
  )
}

export default App
