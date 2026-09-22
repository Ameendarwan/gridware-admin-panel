import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.css';
import './fonts.css';

import AuthProvider from '@app/providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './pages/ErrorFallback';
import { FC } from 'react';
import { Provider } from 'react-redux';
import Routes from './routes';
import { store } from './store';
import { Toaster } from 'sonner';

const App: FC = _props => {
  return (
    <AuthProvider>
      <Provider store={store}>
        <Toaster
          richColors
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            className: 'data-sonner-toast',
          }}
        />
        <BrowserRouter>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Routes />
          </ErrorBoundary>
        </BrowserRouter>
      </Provider>
    </AuthProvider>
  );
};

export default App;
