require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ingestionRoutes = require('./routes/ingestion');
const analyticsRoutes = require('./routes/analytics');
const tenantRoutes = require('./routes/tenants');
const webhookRoutes = require('./routes/webhooks');
const CronService = require('./services/cronService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://xeno-assignment-shopify.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Shopify Data Ingestion API',
    version: '1.0.0',
    endpoints: {
      tenants: '/api/tenants',
      ingestion: '/api/ingestion',
      analytics: '/api/metrics',
    },
  });
});

app.use('/api/tenants', tenantRoutes);
app.use('/api/ingestion', ingestionRoutes);
app.use('/api/metrics', analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  
  if (process.env.NODE_ENV !== 'test') {
    CronService.startDataSync();
    console.log('Cron jobs started');
  }
});

module.exports = app;
