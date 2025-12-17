const prisma = require('./src/config/database');

const tenantId = '790c6565-6e54-480f-aaf4-f18c296786b1';

// Generate dates for the last 30 days
function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Random amount between min and max
function randomAmount(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Random integer between min and max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedDummyData() {
  console.log('🌱 Seeding dummy historical data...\n');

  try {
    // 1. Create dummy customers (if needed)
    console.log('Creating dummy customers...');
    const customerNames = [
      { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul.sharma@example.com' },
      { firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@example.com' },
      { firstName: 'Amit', lastName: 'Kumar', email: 'amit.kumar@example.com' },
      { firstName: 'Sneha', lastName: 'Reddy', email: 'sneha.reddy@example.com' },
      { firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@example.com' },
      { firstName: 'Anjali', lastName: 'Mehta', email: 'anjali.mehta@example.com' },
      { firstName: 'Rohan', lastName: 'Verma', email: 'rohan.verma@example.com' },
      { firstName: 'Kavya', lastName: 'Iyer', email: 'kavya.iyer@example.com' },
    ];

    const customers = [];
    for (const customer of customerNames) {
      const existing = await prisma.customer.findFirst({
        where: { 
          tenantId,
          email: customer.email 
        }
      });
      
      if (!existing) {
        const { v4: uuidv4 } = require('uuid');
        const customerDate = getRandomDate(randomInt(60, 90));
        const newCustomer = await prisma.customer.create({
          data: {
            id: uuidv4(),
            tenantId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            createdAt: customerDate,
            updatedAt: customerDate,
          }
        });
        customers.push(newCustomer);
        console.log(`✓ Created customer: ${customer.firstName} ${customer.lastName}`);
      } else {
        customers.push(existing);
      }
    }

    // 2. Get existing products
    console.log('\nFetching existing products...');
    const products = await prisma.product.findMany({
      where: { tenantId },
      take: 10
    });
    
    if (products.length === 0) {
      console.log('⚠️  No products found. Please sync products first!');
      return;
    }
    console.log(`Found ${products.length} products`);

    // 3. Create dummy orders for last 30 days
    console.log('\nCreating dummy orders...');
    let orderCount = 0;
    
    for (let day = 30; day >= 0; day--) {
      // Create 1-4 orders per day
      const ordersPerDay = randomInt(1, 4);
      
      for (let i = 0; i < ordersPerDay; i++) {
        const orderDate = getRandomDate(day);
        const customer = customers[randomInt(0, customers.length - 1)];
        const totalPrice = randomAmount(500, 5000);
        
        const { v4: uuidv4 } = require('uuid');
        const order = await prisma.order.create({
          data: {
            id: uuidv4(),
            tenantId,
            customerId: customer.id,
            orderNumber: randomInt(10000, 99999),
            totalPrice: totalPrice,
            currency: 'INR',
            createdAt: orderDate,
            updatedAt: orderDate,
          }
        });
        
        orderCount++;
        if (orderCount % 10 === 0) {
          console.log(`Created ${orderCount} orders...`);
        }
      }
    }

    console.log(`\n✅ Successfully created ${orderCount} dummy orders!`);
    console.log(`📊 Data spans last 30 days with realistic distribution\n`);

    // Show summary
    const totalOrders = await prisma.order.count({ where: { tenantId } });
    const totalRevenue = await prisma.order.aggregate({
      where: { tenantId },
      _sum: { totalPrice: true }
    });
    
    console.log('📈 Dashboard Summary:');
    console.log(`   Total Orders: ${totalOrders}`);
    console.log(`   Total Revenue: ₹${parseFloat(totalRevenue._sum.totalPrice || 0).toLocaleString('en-IN')}`);
    console.log(`   Total Customers: ${customers.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedDummyData();
