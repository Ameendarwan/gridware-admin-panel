import { FC } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import Routes from './routes';
import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App: FC = _props => {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
  );
};

export default App;
