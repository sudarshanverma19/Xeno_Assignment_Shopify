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
}

module.exports = AnalyticsService;
