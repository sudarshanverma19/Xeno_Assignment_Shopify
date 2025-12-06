import React, { useState, useEffect } from 'react';
import {
  getOverview,
  getOrdersByDate,
  getTopCustomers,
  getTopProducts,
  getProductBreakdown,
  getInventoryAlerts,
  syncAllData,
} from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

function Dashboard({ tenant, onLogout }) {
  const [overview, setOverview] = useState(null);
  const [ordersData, setOrdersData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [productBreakdown, setProductBreakdown] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState({ lowStock: [], highStock: [] });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [tenant, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        overviewData, 
        ordersChartData, 
        customersData, 
        productsData, 
        breakdownData,
        alertsData
      ] = await Promise.all([
        getOverview(tenant.id),
        getOrdersByDate(tenant.id, dateRange),
        getTopCustomers(tenant.id, 5),
        getTopProducts(tenant.id, 5),
        getProductBreakdown(tenant.id),
        getInventoryAlerts(tenant.id),
      ]);

      setOverview(overviewData);
      setOrdersData(ordersChartData);
      setTopCustomers(customersData);
      setTopProducts(productsData);
      setProductBreakdown(breakdownData);
      setInventoryAlerts(alertsData);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');

    try {
      const response = await syncAllData(tenant.id);
      
      if (response.results) {
        const { products, customers, orders, errors } = response.results;
        let message = `Synced: ${products} products`;
        if (customers > 0) message += `, ${customers} customers`;
        if (orders > 0) message += `, ${orders} orders`;
        
        if (errors && errors.length > 0) {
          message += `\n\nNote: Some data requires additional Shopify permissions.`;
        }
        
        alert(message);
      } else {
        alert('Data sync completed!');
      }
      
      fetchData(); // Refresh data after sync
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to sync data';
      setError(`Sync error: ${errorMsg}`);
      console.error('Error syncing data:', err);
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Shopify Insights Dashboard</h1>
          <p className="shop-name">{tenant.shopUrl}</p>
        </div>
        <div className="header-right">
          <button
            className="sync-button"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? '⟳ Syncing...' : '↻ Sync Data'}
          </button>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && <div className="error-banner">{error}</div>}

      {/* Overview Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon customers">👥</div>
          <div className="metric-content">
            <h3>Total Customers</h3>
            <p className="metric-value">{overview?.totalCustomers || 0}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon orders">📦</div>
          <div className="metric-content">
            <h3>Total Orders</h3>
            <p className="metric-value">{overview?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon revenue">💰</div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-value">
              {formatCurrency(overview?.totalRevenue || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        {/* Orders Over Time Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Orders Over Time</h2>
            <select
              className="date-range-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <div className="chart-content">
            {ordersData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'revenue') {
                        return [formatCurrency(value), 'Revenue'];
                      }
                      return [value, 'Orders'];
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#667eea"
                    strokeWidth={2}
                    name="Orders"
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#34d399"
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No order data available for the selected period</div>
            )}
          </div>
        </div>

        {/* Top Customers Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Top 5 Customers by Spend</h2>
          </div>
          <div className="chart-content">
            {topCustomers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCustomers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalSpent"
                    fill="#764ba2"
                    name="Total Spent"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No customer data available</div>
            )}
          </div>
        </div>

        {/* Top Performing Products */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Top 5 Products (Lowest Stock)</h2>
          </div>
          <div className="chart-content">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="inventoryQuantity"
                    fill="#f59e0b"
                    name="Stock Remaining"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No product data available</div>
            )}
          </div>
        </div>

        {/* Product Breakdown Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Product Inventory Breakdown</h2>
          </div>
          <div className="chart-content">
            {productBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No product breakdown available</div>
            )}
          </div>
        </div>

        {/* Inventory Alerts Histogram */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h2>Inventory Alerts: Low Stock vs Excess Stock</h2>
          </div>
          <div className="chart-content">
            {(inventoryAlerts.lowStock.length > 0 || inventoryAlerts.highStock.length > 0) ? (
              <>
                {inventoryAlerts.lowStock.length > 0 && (
                  <div className="alert-section critical">
                    <h3>⚠️ Critical: Low Stock Alert</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={inventoryAlerts.lowStock}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          angle={-15}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="stock" fill="#ef4444" name="Stock Level" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {inventoryAlerts.highStock.length > 0 && (
                  <div className="alert-section warning">
                    <h3>📦 Warning: Excess Stock</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={inventoryAlerts.highStock}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          angle={-15}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="stock" fill="#fbbf24" name="Stock Level" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="no-data">All inventory levels are optimal</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2024 Shopify Insights Dashboard | Multi-tenant Analytics Platform</p>
      </footer>
    </div>
  );
}

export default Dashboard;
