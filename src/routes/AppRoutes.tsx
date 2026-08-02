import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login/Login';
import { AdminDashboard } from '../pages/AdminDashboard/AdminDashboard';
import { BirthdayDashboard } from '../pages/BirthdayDashboard/BirthdayDashboard';
import { Unauthorized } from '../pages/Unauthorized/Unauthorized';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import { Layout } from '../components/Layout/Layout';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Admin Dashboard with Dedicated Full CMS Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Birthday Dashboard with Dedicated OurVerse User Layout */}
      <Route
        path="/birthday"
        element={
          <ProtectedRoute allowedRole="birthday">
            <BirthdayDashboard />
          </ProtectedRoute>
        }
      />

      {/* Routes wrapped with Public Navbar Layout */}
      <Route element={<Layout />}>
        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
