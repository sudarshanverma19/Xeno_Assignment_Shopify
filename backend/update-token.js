const prisma = require('./src/config/database');

const tenantId = '790c6565-6e54-480f-aaf4-f18c296786b1';
const newToken = process.env.SHOPIFY_ACCESS_TOKEN || 'your_token_here';

console.log('Updating token in database...');

prisma.tenant.update({
  where: { id: tenantId },
  data: { accessToken: newToken }
})
  .then((result) => {
    console.log('✅ Token updated successfully!');
    console.log('Shop:', result.shopUrl);
    console.log('New Token:', result.accessToken);
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error updating token:', error.message);
    prisma.$disconnect();
    process.exit(1);
  });
