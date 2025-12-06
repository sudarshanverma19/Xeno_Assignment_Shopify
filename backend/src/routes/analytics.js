const express = require('express');
const AnalyticsService = require('../services/analyticsService');

const router = express.Router();

// Get overview metrics
router.get('/overview', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const analyticsService = new AnalyticsService(tenantId);
    const overview = await analyticsService.getOverview();

    res.json(overview);
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get orders by date
router.get('/orders-by-date', async (req, res) => {
  try {
    const { tenantId, range = '30d' } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const analyticsService = new AnalyticsService(tenantId);
    const data = await analyticsService.getOrdersByDate(range);

    res.json(data);
  } catch (error) {
    console.error('Error fetching orders by date:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get top customers
router.get('/top-customers', async (req, res) => {
  try {
    const { tenantId, limit = '5' } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const analyticsService = new AnalyticsService(tenantId);
    const customers = await analyticsService.getTopCustomers(parseInt(limit));

    res.json(customers);
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product stats
router.get('/products', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const analyticsService = new AnalyticsService(tenantId);
    const stats = await analyticsService.getProductStats();

    res.json(stats);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get top performing products
router.get('/top-products', async (req, res) => {
  try {
    const { tenantId, limit = '5' } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const analyticsService = new AnalyticsService(tenantId);
    const products = await analyticsService.getTopPerformingProducts(parseInt(limit));

    res.json(products);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product breakdown for pie chart
router.get('/product-breakdown', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const analyticsService = new AnalyticsService(tenantId);
    const breakdown = await analyticsService.getProductBreakdown();

    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching product breakdown:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get inventory alerts
router.get('/inventory-alerts', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const analyticsService = new AnalyticsService(tenantId);
    const alerts = await analyticsService.getInventoryAlerts();

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
