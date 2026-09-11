import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (pool) return pool;

  // Support DATABASE_URL or individual environment variables
  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

  let poolConfig: PoolOptions;

  if (databaseUrl) {
    // Parse DATABASE_URL / MYSQL_URL
    const url = new URL(databaseUrl);
    poolConfig = {
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl:
        process.env.MYSQL_SSL === 'true' ||
        url.searchParams.get('sslmode') === 'require' ||
        url.hostname.includes('tidbcloud.com')
          ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
          : undefined,
    };
  } else {
    poolConfig = {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'lost_and_found_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };
  }

  pool = mysql.createPool(poolConfig);
  return pool;
}

/**
 * Execute a parameterized SELECT query returning an array of rows
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getDbPool();
  const [rows] = await db.query<RowDataPacket[] & T[]>(sql, params);
  return rows as T[];
}

/**
 * Execute a parameterized SELECT query returning the first matching row or null
 */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT, UPDATE, or DELETE query returning affected rows and insertId
 */
export async function execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const db = getDbPool();
  const [result] = await db.execute<ResultSetHeader>(sql, params);
  return result;
}

export { pool };
