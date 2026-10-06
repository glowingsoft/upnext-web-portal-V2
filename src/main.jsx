import ReactDOM from 'react-dom/client';
import { Suspense, StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import App from './app';
import { CONFIG } from './config-global';
import { ChunkErrorBoundary } from './components/error-boundary/chunk-error-boundary';

import { persistor, store } from './store/store';
import { captureTrafficSource } from './utils/traffic-source';
captureTrafficSource();


window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();

  if (!sessionStorage.getItem('reloaded-after-preload-error')) {
    sessionStorage.setItem('reloaded-after-preload-error', '1');
    window.location.reload();
  }
});

window.setTimeout(() => sessionStorage.removeItem('reloaded-after-preload-error'), 10000);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={CONFIG.site.basePath}>
        <Suspense>
          <ChunkErrorBoundary>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <App />
              </PersistGate>
            </Provider>
          </ChunkErrorBoundary>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
