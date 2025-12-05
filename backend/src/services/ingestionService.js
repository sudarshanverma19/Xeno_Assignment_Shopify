const prisma = require('../config/database');
const ShopifyService = require('./shopifyService');

class IngestionService {
  constructor(tenant) {
    this.tenant = tenant;
    this.shopifyService = new ShopifyService(tenant.shopUrl, tenant.accessToken);
  }

  async ingestProducts() {
    console.log(`[Ingestion] Fetching products for tenant: ${this.tenant.shopUrl}`);
    
    const products = await this.shopifyService.fetchProducts();
    console.log(`[Ingestion] Fetched ${products.length} products`);

    for (const product of products) {
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
          tenantId: this.tenant.id,
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
    }

    console.log(`[Ingestion] Stored ${products.length} products`);
    return products.length;
  }

  async ingestCustomers() {
    console.log(`[Ingestion] Fetching customers for tenant: ${this.tenant.shopUrl}`);
    
    const customers = await this.shopifyService.fetchCustomers();
    console.log(`[Ingestion] Fetched ${customers.length} customers`);

    for (const customer of customers) {
      await prisma.customer.upsert({
        where: { id: String(customer.id) },
        update: {
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          ordersCount: customer.orders_count || 0,
          totalSpent: customer.total_spent ? parseFloat(customer.total_spent) : 0,
          phone: customer.phone,
          verifiedEmail: customer.verified_email || false,
          state: customer.state,
          note: customer.note,
          currency: customer.currency,
          updatedAt: new Date(customer.updated_at),
        },
        create: {
          id: String(customer.id),
          tenantId: this.tenant.id,
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          ordersCount: customer.orders_count || 0,
          totalSpent: customer.total_spent ? parseFloat(customer.total_spent) : 0,
          phone: customer.phone,
          verifiedEmail: customer.verified_email || false,
          state: customer.state,
          note: customer.note,
          currency: customer.currency,
          createdAt: new Date(customer.created_at),
          updatedAt: new Date(customer.updated_at),
        },
      });
    }

    console.log(`[Ingestion] Stored ${customers.length} customers`);
    return customers.length;
  }

  async ingestOrders() {
    console.log(`[Ingestion] Fetching orders for tenant: ${this.tenant.shopUrl}`);
    
    const orders = await this.shopifyService.fetchOrders();
    console.log(`[Ingestion] Fetched ${orders.length} orders`);

    for (const order of orders) {
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
          cancelledAt: order.cancelled_at ? new Date(order.cancelled_at) : null,
          closedAt: order.closed_at ? new Date(order.closed_at) : null,
          processedAt: order.processed_at ? new Date(order.processed_at) : null,
          updatedAt: new Date(order.updated_at),
        },
        create: {
          id: String(order.id),
          tenantId: this.tenant.id,
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
          cancelledAt: order.cancelled_at ? new Date(order.cancelled_at) : null,
          closedAt: order.closed_at ? new Date(order.closed_at) : null,
          processedAt: order.processed_at ? new Date(order.processed_at) : null,
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at),
        },
      });
    }

    console.log(`[Ingestion] Stored ${orders.length} orders`);
    return orders.length;
  }

  async ingestAll() {
    const results = {
      products: 0,
      customers: 0,
      orders: 0,
      errors: [],
    };

    // Try products
    try {
      results.products = await this.ingestProducts();
    } catch (error) {
      console.error('[Ingestion] Products Error:', error.message);
      results.errors.push({ entity: 'products', error: error.message });
    }

    // Try customers
    try {
      results.customers = await this.ingestCustomers();
    } catch (error) {
      console.error('[Ingestion] Customers Error:', error.message);
      results.errors.push({ entity: 'customers', error: 'Permission denied - requires read_customers scope' });
    }

    // Try orders
    try {
      results.orders = await this.ingestOrders();
    } catch (error) {
      console.error('[Ingestion] Orders Error:', error.message);
      results.errors.push({ entity: 'orders', error: 'Permission denied - requires read_orders scope' });
    }

    return results;
  }
}

module.exports = IngestionService;
