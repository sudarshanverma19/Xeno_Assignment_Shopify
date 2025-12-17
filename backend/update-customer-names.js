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

async function updateCustomerNames() {
  console.log('✏️  Updating customer names...\n');

  try {
    // Get all customers (we'll update those with empty or null names)
    const customers = await prisma.customer.findMany({
      where: { tenantId }
    });

    console.log(`Found ${customers.length} customers\n`);

    for (let i = 0; i < customers.length; i++) {
      // Only update if firstName or lastName is empty/null
      if (!customers[i].firstName || !customers[i].lastName || 
          customers[i].firstName.trim() === '' || customers[i].lastName.trim() === '') {
        
        const name = indianNames[i % indianNames.length];
        
        await prisma.customer.update({
          where: { id: customers[i].id },
          data: {
            firstName: name.firstName,
            lastName: name.lastName,
          }
        });
        
        console.log(`✓ Updated customer: ${name.firstName} ${name.lastName} (₹${customers[i].totalSpent.toFixed(2)} spent)`);
      } else {
        console.log(`- Skipped: ${customers[i].firstName} ${customers[i].lastName} (already has name)`);
      }
    }

    console.log('\n✅ All customers now have names!');
    console.log('📊 Your "Top 5 Customers" chart will now show proper names.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateCustomerNames();
