const express = require('express');
const prisma = require('../config/database');

const router = express.Router();

// Get all tenants
router.get('/', async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        shopUrl: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json({ tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tenant by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        shopUrl: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new tenant
router.post('/', async (req, res) => {
  try {
    const { shopUrl, accessToken, email } = req.body;

    if (!shopUrl || !accessToken) {
      return res.status(400).json({ error: 'shopUrl and accessToken are required' });
    }

    const tenant = await prisma.tenant.create({
      data: {
        shopUrl,
        accessToken,
        email,
      },
    });

    res.status(201).json({
      id: tenant.id,
      shopUrl: tenant.shopUrl,
      email: tenant.email,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update tenant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { shopUrl, accessToken, email, isActive } = req.body;

    const updateData = {};
    if (shopUrl !== undefined) updateData.shopUrl = shopUrl;
    if (accessToken !== undefined) updateData.accessToken = accessToken;
    if (email !== undefined) updateData.email = email;
    if (isActive !== undefined) updateData.isActive = isActive;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        shopUrl: true,
        email: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json(tenant);
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint (simple email-based)
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { email, isActive: true },
      select: {
        id: true,
        shopUrl: true,
        email: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found or inactive' });
    }

    res.json({
      success: true,
      payload: {
        tenant: {
          id: tenant.id,
          shopUrl: tenant.shopUrl,
          email: tenant.email,
        },
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

module.exports = router;
