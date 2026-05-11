import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../../.env') });

const { PORT, MONGO_URI, DB_NAME } = process.env;

export const Config = {
  PORT,
  MONGO_URI,
  DB_NAME,
};
