const express = require('express');
const prisma = require('../config/database');
const IngestionService = require('../services/ingestionService');

const router = express.Router();

// Fetch and store products
router.post('/products', async (req, res) => {
  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const ingestionService = new IngestionService(tenant);
    const count = await ingestionService.ingestProducts();

    res.json({
      success: true,
      message: `Ingested ${count} products`,
      count,
    });
  } catch (error) {
    console.error('Error ingesting products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch and store customers
router.post('/customers', async (req, res) => {
  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const ingestionService = new IngestionService(tenant);
    const count = await ingestionService.ingestCustomers();

    res.json({
      success: true,
      message: `Ingested ${count} customers`,
      count,
    });
  } catch (error) {
    console.error('Error ingesting customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch and store orders
router.post('/orders', async (req, res) => {
  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const ingestionService = new IngestionService(tenant);
    const count = await ingestionService.ingestOrders();

    res.json({
      success: true,
      message: `Ingested ${count} orders`,
      count,
    });
  } catch (error) {
    console.error('Error ingesting orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ingest all data (products, customers, orders)
router.post('/sync-all', async (req, res) => {
  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const ingestionService = new IngestionService(tenant);
    const results = await ingestionService.ingestAll();

    const hasErrors = results.errors && results.errors.length > 0;
    const successCount = results.products + results.customers + results.orders;

    res.json({
      success: successCount > 0,
      message: hasErrors 
        ? `Partial sync completed: ${successCount} items synced with ${results.errors.length} errors`
        : 'Data sync completed successfully',
      results,
      warning: hasErrors ? 'Some data could not be synced due to permission restrictions' : null,
    });
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all products
router.get('/products', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const products = await prisma.product.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all customers
router.get('/customers', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const customers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    res.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const orders = await prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
