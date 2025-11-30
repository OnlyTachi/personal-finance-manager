import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogOut, User } from 'lucide-react';

import CalculatorPage from './pages/Calculator';
import DashboardPage from './pages/Dashboard';
import AddAssetPage from './pages/AddAsset';
import AssetDetailsPage from './pages/AssetDetails';
import PassivosPage from './pages/Passivos';
import PassivoDetailsPage from './pages/PassivoDetails'; // Import Novo
import LoginPage from './pages/Login';
import HelpPage from './pages/Help';
import HistoryPage from './pages/History';

function PrivateRoute({ children }) {
  const { signed, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Carregando...</div>;
  return signed ? children : <Navigate to="/login" />;
}

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/' && location.pathname === '/dashboard');
  
  return (
    <Link to={to} className={`text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>{children}</Link>
  );
}

function AppContent() {
  const { user, signOut, signed } = useAuth();

  if (!signed) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <nav className="border-b border-secondary/30 bg-surface sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Carteira Pessoal</Link>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/passivos">Dívidas</NavLink>
              <NavLink to="/calculator">Calculadora</NavLink>
              <NavLink to="/history">Histórico</NavLink>
              <NavLink to="/help">Ajuda</NavLink>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-secondary/30">
              <span className="text-xs text-gray-400 flex items-center gap-1"><User className="w-3 h-3" /> {user?.username}</span>
              <button onClick={signOut} className="text-red-400 hover:text-red-300" title="Sair"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          <Route path="/calculator" element={<PrivateRoute><CalculatorPage /></PrivateRoute>} />
          <Route path="/passivos" element={<PrivateRoute><PassivosPage /></PrivateRoute>} />
          <Route path="/passivos/:id" element={<PrivateRoute><PassivoDetailsPage /></PrivateRoute>} /> {/* Rota Nova */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} /> 
          <Route path="/add-investment" element={<PrivateRoute><AddAssetPage /></PrivateRoute>} />
          <Route path="/asset/:id" element={<PrivateRoute><AssetDetailsPage /></PrivateRoute>} />
          <Route path="/help" element={<PrivateRoute><HelpPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}