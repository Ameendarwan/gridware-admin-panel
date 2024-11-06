import { FC } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import './globals.css'
import MailPage from './pages/mail/page'

const App: FC = _props => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <MailPage/>
      </BrowserRouter>
    </Provider>
  )
}

export default App
