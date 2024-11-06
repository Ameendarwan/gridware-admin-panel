import { FC } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import './globals.css'

const App: FC = _props => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="bg-blue-500 h-[100%] w-[100%]">
          <span>Template</span>
        </div>
      </BrowserRouter>
    </Provider>
  )
}

export default App
