require('dotenv').config();
const prisma = require('../config/database');

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create initial tenant
    const tenant = await prisma.tenant.upsert({
      where: { shopUrl: process.env.SHOPIFY_STORE_URL },
      update: {},
      create: {
        shopUrl: process.env.SHOPIFY_STORE_URL,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
        email: 'admin@example.com',
        isActive: true,
      },
    });

    console.log('✅ Created tenant:', {
      id: tenant.id,
      shopUrl: tenant.shopUrl,
      email: tenant.email,
    });

    console.log('\n🎉 Seeding completed!');
    console.log('\n📝 Use these credentials to login:');
    console.log(`   Email: ${tenant.email}`);
    console.log(`   Tenant ID: ${tenant.id}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
