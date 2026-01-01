import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Properties from './pages/Properties/Properties';
import PropertyDetails from './pages/Properties/PropertyDetails';
import Tenants from './pages/Tenants/Tenants';
import Statistics from './pages/Statistics/Statistics';
import PaymentsPage from './pages/Payment/Payment';
import PaymentHistoryPage from './pages/Payment/paymentHistory';
import Analytics from './pages/Analytics/Analytics';
import Maintenance from './pages/Maintenance/Maintenance';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />
                <Route path="/tenants" element={<Tenants />} />
                <Route path="/statistics" element={<Statistics />} />
                 <Route path="/payment" element={<PaymentsPage />} />
                <Route path="/paymenthistory" element={<PaymentHistoryPage />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;

