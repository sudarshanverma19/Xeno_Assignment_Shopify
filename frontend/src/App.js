import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  // Mock tenant data to bypass login
  const mockTenant = {
    id: 1,
    shop_name: 'Demo Shop',
    shop_url: 'demo-shop.myshopify.com'
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
