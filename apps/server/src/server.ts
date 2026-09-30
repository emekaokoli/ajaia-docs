import 'dotenv/config';
import { db } from '@ajaia/db';
import { createApp } from '@/app';
import { logger } from '@/utils/logger';

const port = process.env.PORT || 1829;

async function assertDatabase(): Promise<void> {
  try {
    await db.raw('SELECT 1');
  } catch (err) {
    logger.error({ err }, 'Database unreachable, refusing to boot');
    await db.destroy();
    process.exit(1);
  }
}

async function main(): Promise<void> {
  await assertDatabase();
  createApp().listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
}

void main();

process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `Unhandled Rejection at Promise: ${JSON.stringify({
      promise,
      reason: reason instanceof Error ? reason.message : reason,
    })}`,
  );
  process.exit(1);
});