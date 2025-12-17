import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  // Mock tenant data to bypass login - using actual tenant from database
  const mockTenant = {
    id: '790c6565-6e54-480f-aaf4-f18c296786b1',
    shopUrl: 'xeno-sudarshan-shop.myshopify.com',
    email: 'admin@example.com'
  };
  
  const [tenant] = useState(mockTenant);

  const handleLogout = () => {
    // Logout functionality disabled
    console.log('Logout disabled in demo mode');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <Dashboard tenant={tenant} onLogout={handleLogout} />
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
