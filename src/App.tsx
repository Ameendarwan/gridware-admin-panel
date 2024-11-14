import { FC } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ErrorBoundary } from 'react-error-boundary';
import { store } from './store';
import Routes from './routes';
import ErrorFallback from './pages/ErrorFallback';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const App: FC = _props => {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}>
        <BrowserRouter>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Routes />
          </ErrorBoundary>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
  );
};

export default App;
