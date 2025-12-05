const express = require('express');
const prisma = require('../config/database');

const router = express.Router();

// Webhook endpoint for Shopify
router.post('/shopify/orders/create', async (req, res) => {
  try {
    console.log('[Webhook] Received order created webhook');
    
    // Verify webhook (in production, verify HMAC signature)
    const shopDomain = req.get('X-Shopify-Shop-Domain');
    
    if (!shopDomain) {
      return res.status(400).json({ error: 'Missing shop domain' });
    }

    // Find tenant by shop URL
    const tenant = await prisma.tenant.findFirst({
      where: { shopUrl: shopDomain },
    });

    if (!tenant) {
      console.log(`[Webhook] Tenant not found for shop: ${shopDomain}`);
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const order = req.body;

    // Store the order
    await prisma.order.upsert({
      where: { id: String(order.id) },
      update: {
        customerId: order.customer?.id ? String(order.customer.id) : null,
        email: order.email,
        orderNumber: order.order_number,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        totalPrice: parseFloat(order.total_price),
        subtotalPrice: order.subtotal_price ? parseFloat(order.subtotal_price) : null,
        totalTax: order.total_tax ? parseFloat(order.total_tax) : null,
        totalDiscounts: order.total_discounts ? parseFloat(order.total_discounts) : null,
        currency: order.currency,
        lineItemsCount: order.line_items ? order.line_items.length : 0,
        totalWeight: order.total_weight,
        processedAt: order.processed_at ? new Date(order.processed_at) : null,
        updatedAt: new Date(order.updated_at),
      },
      create: {
        id: String(order.id),
        tenantId: tenant.id,
        customerId: order.customer?.id ? String(order.customer.id) : null,
        email: order.email,
        orderNumber: order.order_number,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        totalPrice: parseFloat(order.total_price),
        subtotalPrice: order.subtotal_price ? parseFloat(order.subtotal_price) : null,
        totalTax: order.total_tax ? parseFloat(order.total_tax) : null,
        totalDiscounts: order.total_discounts ? parseFloat(order.total_discounts) : null,
        currency: order.currency,
        lineItemsCount: order.line_items ? order.line_items.length : 0,
        totalWeight: order.total_weight,
        processedAt: order.processed_at ? new Date(order.processed_at) : null,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at),
      },
    });

    console.log(`[Webhook] Order ${order.id} processed successfully`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook for product updates
router.post('/shopify/products/update', async (req, res) => {
  try {
    console.log('[Webhook] Received product update webhook');
    
    const shopDomain = req.get('X-Shopify-Shop-Domain');
    
    if (!shopDomain) {
      return res.status(400).json({ error: 'Missing shop domain' });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { shopUrl: shopDomain },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const product = req.body;
    const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null;

    await prisma.product.upsert({
      where: { id: String(product.id) },
      update: {
        title: product.title,
        bodyHtml: product.body_html,
        vendor: product.vendor,
        productType: product.product_type,
        handle: product.handle,
        status: product.status,
        publishedAt: product.published_at ? new Date(product.published_at) : null,
        variantsCount: product.variants ? product.variants.length : 0,
        price: variant ? parseFloat(variant.price) : null,
        compareAtPrice: variant?.compare_at_price ? parseFloat(variant.compare_at_price) : null,
        inventoryQuantity: variant?.inventory_quantity || 0,
        updatedAt: new Date(product.updated_at),
      },
      create: {
        id: String(product.id),
        tenantId: tenant.id,
        title: product.title,
        bodyHtml: product.body_html,
        vendor: product.vendor,
        productType: product.product_type,
        handle: product.handle,
        status: product.status,
        publishedAt: product.published_at ? new Date(product.published_at) : null,
        variantsCount: product.variants ? product.variants.length : 0,
        price: variant ? parseFloat(variant.price) : null,
        compareAtPrice: variant?.compare_at_price ? parseFloat(variant.compare_at_price) : null,
        inventoryQuantity: variant?.inventory_quantity || 0,
        createdAt: new Date(product.created_at),
        updatedAt: new Date(product.updated_at),
      },
    });

    console.log(`[Webhook] Product ${product.id} processed successfully`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
