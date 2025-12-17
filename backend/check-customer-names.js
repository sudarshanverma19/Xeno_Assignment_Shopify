const prisma = require('./src/config/database');

const tenantId = '790c6565-6e54-480f-aaf4-f18c296786b1';

// Indian names for customers
const indianNames = [
  { firstName: 'Rajesh', lastName: 'Kumar' },
  { firstName: 'Priya', lastName: 'Sharma' },
  { firstName: 'Amit', lastName: 'Patel' },
  { firstName: 'Sneha', lastName: 'Reddy' },
  { firstName: 'Vikram', lastName: 'Singh' },
  { firstName: 'Anjali', lastName: 'Mehta' },
  { firstName: 'Rohan', lastName: 'Verma' },
  { firstName: 'Kavya', lastName: 'Iyer' },
  { firstName: 'Arjun', lastName: 'Gupta' },
  { firstName: 'Pooja', lastName: 'Joshi' },
];

async function checkAndUpdateCustomers() {
  console.log('🔍 Checking customers linked to orders...\n');

  try {
    // Get all orders with customer info
    const orders = await prisma.order.findMany({
      where: { tenantId },
      include: {
        customer: true
      }
    });

    console.log(`Found ${orders.length} orders\n`);

    // Find customers who need names
    const customerIds = new Set();
    for (const order of orders) {
      if (order.customer) {
        const needsUpdate = !order.customer.firstName || 
                           !order.customer.lastName || 
                           order.customer.firstName.trim() === '' || 
                           order.customer.lastName.trim() === '';
        
        if (needsUpdate) {
          customerIds.add(order.customer.id);
          console.log(`❌ Order #${order.orderNumber}: Customer ID ${order.customer.id} - firstName: "${order.customer.firstName}", lastName: "${order.customer.lastName}"`);
        } else {
          console.log(`✓ Order #${order.orderNumber}: ${order.customer.firstName} ${order.customer.lastName}`);
        }
      } else {
        console.log(`⚠️  Order #${order.orderNumber}: No customer linked`);
      }
    }

    // Update customers who need names
    if (customerIds.size > 0) {
      console.log(`\n📝 Updating ${customerIds.size} customers...\n`);
      
      let i = 0;
      for (const customerId of customerIds) {
        const name = indianNames[i % indianNames.length];
        
        await prisma.customer.update({
          where: { id: customerId },
          data: {
            firstName: name.firstName,
            lastName: name.lastName,
          }
        });
        
        console.log(`✓ Updated customer ${customerId}: ${name.firstName} ${name.lastName}`);
        i++;
      }
    } else {
      console.log('\n✅ All customers already have names!');
    }

    console.log('\n🎉 Done! Refresh your dashboard to see the changes.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdateCustomers();
