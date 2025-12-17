const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTenants() {
  try {
    const tenants = await prisma.tenant.findMany();
    console.log('Available tenants:', JSON.stringify(tenants, null, 2));
    
    if (tenants.length > 0) {
      const firstTenant = tenants[0];
      console.log('\n=== Using first tenant ===');
      console.log('ID:', firstTenant.id);
      console.log('Shop Name:', firstTenant.shop_name);
      console.log('Shop URL:', firstTenant.shop_url);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenants();
