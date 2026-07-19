import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './App.jsx';
import { store } from './app/store.js';
import { setupInterceptors } from './api/interceptors.js';
import AuthProvider from './features/auth/AuthProvider.jsx';
import ToastContainer from './components/ToastContainer.jsx';

// Must run once, after the store exists, before any request fires.
setupInterceptors(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
        <ToastContainer />
      </AuthProvider>
    </Provider>
  </StrictMode>
);
