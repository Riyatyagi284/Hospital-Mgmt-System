import 'reflect-metadata';

import { connectMongoDB } from './config/db.config.js';
import { Config } from './config/index.config.js';
import logger from './config/logger.config.js';

const startServer = async () => {
  try {
    await connectMongoDB(Config.MONGO_URI!, Config.DB_NAME!);

    const { default: app } = await import('./app.js');

    const PORT = Config.PORT || 5000;

    app.listen(PORT, () => {
      logger.info(`Listening on port ${PORT}`);
    });
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};

startServer();
