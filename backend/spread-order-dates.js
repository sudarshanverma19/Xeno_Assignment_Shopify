const prisma = require('./src/config/database');

const tenantId = '790c6565-6e54-480f-aaf4-f18c296786b1';

// Generate a date X days ago
function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function spreadOrderDates() {
  console.log('📅 Spreading orders across different dates...\n');

  try {
    // Get all orders for this tenant
    const orders = await prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`Found ${orders.length} orders to update\n`);

    // Spread orders across last 30 days
    const datesToUse = [25, 20, 15, 10, 5, 2, 1]; // Days ago
    
    for (let i = 0; i < orders.length; i++) {
      const daysAgo = datesToUse[i] || 0;
      const newDate = getDaysAgo(daysAgo);
      
      await prisma.order.update({
        where: { id: orders[i].id },
        data: {
          createdAt: newDate,
          updatedAt: newDate,
        }
      });
      
      console.log(`✓ Order #${orders[i].orderNumber}: ${newDate.toLocaleDateString()} (${daysAgo} days ago) - ₹${orders[i].totalPrice.toFixed(2)}`);
    }

    console.log('\n✅ Successfully spread orders across different dates!');
    console.log('📊 Your "Orders Over Time" chart will now show a nice timeline.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

spreadOrderDates();
