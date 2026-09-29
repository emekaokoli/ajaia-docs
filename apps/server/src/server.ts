import { createApp } from '@/app';
import { logger } from '@/utils/logger';

const port = process.env.PORT || 1829;

createApp().listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `Unhandled Rejection at Promise: ${JSON.stringify({
      promise,
      reason: reason instanceof Error ? reason.message : reason,
    })}`,
  );
  process.exit(1);
});
