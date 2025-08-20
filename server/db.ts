import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { Connector } from '@google-cloud/cloud-sql-connector';
import * as schema from '../shared/schema';

const createPool = async () => {
  if (process.env.NODE_ENV === 'development') {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set for local development.");
    }
    return new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  if (!process.env.INSTANCE_CONNECTION_NAME || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_NAME) {
    throw new Error("Missing Cloud SQL environment variables for production.");
  }
  const connector = new Connector();
  const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
    ipType: 'PUBLIC',
  } as any); // <-- This bypasses the editor's type error

  return new pg.Pool({
    ...clientOpts,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
};

const pool = await createPool();
export const db = drizzle(pool, { schema });