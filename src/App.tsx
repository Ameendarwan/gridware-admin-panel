import { FC } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import './globals.css'
import Sidebar from '@/components/Sidebar/Sidebar'

const App: FC = _props => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    </Provider>
  )
}

export default App
