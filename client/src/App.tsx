import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import AppRoutes from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <AppRoutes />
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

