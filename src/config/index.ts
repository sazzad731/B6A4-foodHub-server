import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: Number(process.env.PORT) || 5000,
  database_url: process.env.DATABASE_URL || "",
  secret: process.env.JWT_SECRET || "",
  env: process.env.NODE_ENV || "development",
};
