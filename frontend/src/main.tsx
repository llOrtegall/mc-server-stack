import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute.js';
import { LoginContainer } from './modules/auth/containers/LoginContainer.js';
import { AuthProvider } from './modules/auth/context/AuthContext.js';
import { ServerDashboard } from './modules/server/containers/ServerDashboard.js';
import { ServerDetailContainer } from './modules/server/containers/ServerDetailContainer.js';
import { Layout } from './shared/components/Layout.js';
import { NotFoundPage } from './shared/components/NotFoundPage.js';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginContainer />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<ServerDashboard />} />
              <Route path="/servers/:id" element={<ServerDetailContainer />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
