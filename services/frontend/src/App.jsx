import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';


import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Patients from './pages/Patients.jsx';
import Home from './pages/Home.jsx';
import ClinicalRecords from './pages/ClinicalRecords.jsx';
import Invoices from './pages/Invoices.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
         <ProtectedRoute>
           <Patients />
         </ProtectedRoute>
       }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/records"
        element={
          <ProtectedRoute>
            <ClinicalRecords />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Invoices />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex-1 bg-gray-100 p-6 overflow-auto">
                <Topbar />
                <Dashboard />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
