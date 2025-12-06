const prisma = require('../config/database');

class AnalyticsService {
  constructor(tenantId) {
    this.tenantId = tenantId;
  }

  async getOverview() {
    const [totalCustomers, totalOrders, revenueData] = await Promise.all([
      prisma.customer.count({
        where: { tenantId: this.tenantId },
      }),
      prisma.order.count({
        where: { tenantId: this.tenantId },
      }),
      prisma.order.aggregate({
        where: { tenantId: this.tenantId },
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    return {
      totalCustomers,
      totalOrders,
      totalRevenue: revenueData._sum.totalPrice || 0,
    };
  }

  async getOrdersByDate(range = '30d') {
    const days = parseInt(range.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.findMany({
      where: {
        tenantId: this.tenantId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const groupedData = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          orders: 0,
          revenue: 0,
        };
      }
      groupedData[date].orders += 1;
      groupedData[date].revenue += order.totalPrice;
    });

    return Object.values(groupedData);
  }

  async getTopCustomers(limit = 5) {
    const customers = await prisma.customer.findMany({
      where: {
        tenantId: this.tenantId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalSpent: true,
        ordersCount: true,
      },
      orderBy: {
        totalSpent: 'desc',
      },
      take: limit,
    });

    return customers.map(customer => ({
      id: customer.id,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || 'Unknown',
      email: customer.email,
      totalSpent: customer.totalSpent,
      ordersCount: customer.ordersCount,
    }));
  }

  async getProductStats() {
    const totalProducts = await prisma.product.count({
      where: { tenantId: this.tenantId },
    });

    const activeProducts = await prisma.product.count({
      where: {
        tenantId: this.tenantId,
        status: 'active',
      },
    });

    return {
      totalProducts,
      activeProducts,
    };
  }

  async getTopPerformingProducts(limit = 5) {
    const products = await prisma.product.findMany({
      where: {
        tenantId: this.tenantId,
      },
      select: {
        id: true,
        title: true,
        price: true,
        inventoryQuantity: true,
      },
      orderBy: {
        inventoryQuantity: 'asc',
      },
      take: limit,
    });

    return products;
  }

  async getProductBreakdown() {
    const products = await prisma.product.findMany({
      where: {
        tenantId: this.tenantId,
        status: 'active',
      },
      select: {
        id: true,
        title: true,
        inventoryQuantity: true,
      },
    });

    return products.map(product => ({
      name: product.title,
      value: product.inventoryQuantity || 0,
    }));
  }

  async getInventoryAlerts() {
    const lowStockThreshold = 10;
    const highStockThreshold = 100;

    const [lowStockProducts, highStockProducts] = await Promise.all([
      prisma.product.findMany({
        where: {
          tenantId: this.tenantId,
          inventoryQuantity: {
            lte: lowStockThreshold,
            gt: 0,
          },
        },
        select: {
          id: true,
          title: true,
          inventoryQuantity: true,
          price: true,
        },
        orderBy: {
          inventoryQuantity: 'asc',
        },
      }),
      prisma.product.findMany({
        where: {
          tenantId: this.tenantId,
          inventoryQuantity: {
            gte: highStockThreshold,
          },
        },
        select: {
          id: true,
          title: true,
          inventoryQuantity: true,
          price: true,
        },
        orderBy: {
          inventoryQuantity: 'desc',
        },
      }),
    ]);

    return {
      lowStock: lowStockProducts.map(p => ({
        name: p.title,
        stock: p.inventoryQuantity,
        category: 'Low Stock',
      })),
      highStock: highStockProducts.map(p => ({
        name: p.title,
        stock: p.inventoryQuantity,
        category: 'Excess Stock',
      })),
    };
  }
}

module.exports = AnalyticsService;
