const cron = require('node-cron');
const prisma = require('../config/database');
const IngestionService = require('../services/ingestionService');

class CronService {
  static startDataSync() {
    // Run every 6 hours: 0 */6 * * *
    // For testing, run every hour: 0 * * * *
    const cronExpression = '0 */6 * * *'; // Every 6 hours

    console.log('[Cron] Scheduling automatic data sync...');

    cron.schedule(cronExpression, async () => {
      console.log('[Cron] Starting scheduled data sync...');

      try {
        // Get all active tenants
        const tenants = await prisma.tenant.findMany({
          where: { isActive: true },
        });

        console.log(`[Cron] Found ${tenants.length} active tenants`);

        for (const tenant of tenants) {
          try {
            console.log(`[Cron] Syncing data for tenant: ${tenant.shopUrl}`);
            
            const ingestionService = new IngestionService(tenant);
            const results = await ingestionService.ingestAll();

            console.log(`[Cron] Sync completed for ${tenant.shopUrl}:`, results);
          } catch (error) {
            console.error(`[Cron] Error syncing tenant ${tenant.shopUrl}:`, error.message);
          }
        }

        console.log('[Cron] Scheduled data sync completed');
      } catch (error) {
        console.error('[Cron] Error during scheduled sync:', error.message);
      }
    });

    console.log(`[Cron] Cron job scheduled with expression: ${cronExpression}`);
  }

  static startManualSync(tenantId) {
    return new Promise(async (resolve, reject) => {
      try {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
        });

        if (!tenant) {
          return reject(new Error('Tenant not found'));
        }

        const ingestionService = new IngestionService(tenant);
        const results = await ingestionService.ingestAll();

        resolve(results);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = CronService;
