const axios = require('axios');

class ShopifyService {
  constructor(shopUrl, accessToken) {
    this.shopUrl = shopUrl;
    this.accessToken = accessToken;
    this.baseUrl = `https://${shopUrl}/admin/api/2024-01`;
  }

  async makeRequest(endpoint) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Shopify API Error (${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  async fetchProducts(limit = 250) {
    let allProducts = [];
    let hasNextPage = true;
    let pageInfo = null;

    while (hasNextPage) {
      let endpoint = `/products.json?limit=${limit}`;
      if (pageInfo) {
        endpoint += `&page_info=${pageInfo}`;
      }

      const data = await this.makeRequest(endpoint);
      allProducts = allProducts.concat(data.products);

      // Check for pagination
      hasNextPage = data.products.length === limit;
      if (hasNextPage && data.products.length > 0) {
        // For simplicity, we'll just do one page. Full implementation would parse Link headers
        hasNextPage = false;
      }
    }

    return allProducts;
  }

  async fetchCustomers(limit = 250) {
    let allCustomers = [];
    let hasNextPage = true;
    let pageInfo = null;

    while (hasNextPage) {
      let endpoint = `/customers.json?limit=${limit}`;
      if (pageInfo) {
        endpoint += `&page_info=${pageInfo}`;
      }

      const data = await this.makeRequest(endpoint);
      allCustomers = allCustomers.concat(data.customers);

      hasNextPage = data.customers.length === limit;
      if (hasNextPage && data.customers.length > 0) {
        hasNextPage = false;
      }
    }

    return allCustomers;
  }

  async fetchOrders(limit = 250, status = 'any') {
    let allOrders = [];
    let hasNextPage = true;
    let pageInfo = null;

    while (hasNextPage) {
      let endpoint = `/orders.json?limit=${limit}&status=${status}`;
      if (pageInfo) {
        endpoint += `&page_info=${pageInfo}`;
      }

      const data = await this.makeRequest(endpoint);
      allOrders = allOrders.concat(data.orders);

      hasNextPage = data.orders.length === limit;
      if (hasNextPage && data.orders.length > 0) {
        hasNextPage = false;
      }
    }

    return allOrders;
  }
}

module.exports = ShopifyService;
