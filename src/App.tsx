import { FC } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import Mail from './pages/mail/Mail'
import './globals.css'

const App: FC = _props => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Mail />
      </BrowserRouter>
    </Provider>
  )
}

export default App
