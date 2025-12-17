const prisma = require('./src/config/database');

const tenantId = '790c6565-6e54-480f-aaf4-f18c296786b1';

async function cleanupDummyData() {
  console.log('🧹 Cleaning up dummy data...\n');

  try {
    // 1. Delete all dummy orders
    console.log('Deleting dummy orders...');
    const deletedOrders = await prisma.order.deleteMany({
      where: {
        tenantId,
        orderNumber: {
          gte: 10000, // Dummy orders have order numbers >= 10000
        }
      }
    });
    console.log(`✓ Deleted ${deletedOrders.count} dummy orders`);

    // 2. Delete all dummy customers
    console.log('Deleting dummy customers...');
    const deletedCustomers = await prisma.customer.deleteMany({
      where: {
        tenantId,
        email: {
          endsWith: '@example.com', // Dummy customers have @example.com emails
        }
      }
    });
    console.log(`✓ Deleted ${deletedCustomers.count} dummy customers`);

    // 3. Update real customers with totalSpent based on their orders
    console.log('\nUpdating customer spending data...');
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      include: {
        orders: true
      }
    });

    for (const customer of customers) {
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalPrice, 0);
      const ordersCount = customer.orders.length;
      
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          totalSpent,
          ordersCount
        }
      });
      
      if (totalSpent > 0) {
        console.log(`✓ ${customer.firstName} ${customer.lastName}: ${ordersCount} orders, ₹${totalSpent.toFixed(2)}`);
      }
    }

    // 4. Show summary
    console.log('\n📊 Final Dashboard Data:');
    const totalOrders = await prisma.order.count({ where: { tenantId } });
    const totalCustomers = await prisma.customer.count({ where: { tenantId } });
    const revenue = await prisma.order.aggregate({
      where: { tenantId },
      _sum: { totalPrice: true }
    });
    
    console.log(`   Total Orders: ${totalOrders}`);
    console.log(`   Total Customers: ${totalCustomers}`);
    console.log(`   Total Revenue: ₹${(revenue._sum.totalPrice || 0).toLocaleString('en-IN')}`);
    console.log('\n✅ Cleanup complete! Original data restored.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDummyData();
