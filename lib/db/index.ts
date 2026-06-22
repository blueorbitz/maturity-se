import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import * as schema from './schema'

const isAWSAurora = process.env.AWS_AURORA_PGHOST && process.env.AWS_AURORA_PGUSER

let pool: Pool

if (isAWSAurora) {
  // AWS Aurora PostgreSQL with IAM authentication
  const signer = new Signer({
    region: process.env.AWS_AURORA_AWS_REGION!,
    hostname: process.env.AWS_AURORA_PGHOST!,
    port: Number(process.env.AWS_AURORA_PGPORT || 5432),
    username: process.env.AWS_AURORA_PGUSER!,
  })

  pool = new Pool({
    host: process.env.AWS_AURORA_PGHOST,
    port: Number(process.env.AWS_AURORA_PGPORT || 5432),
    database: process.env.AWS_AURORA_PGDATABASE,
    user: process.env.AWS_AURORA_PGUSER,
    password: signer.getAuthToken({
      username: process.env.AWS_AURORA_PGUSER!,
    }),
    ssl: process.env.AWS_AURORA_PGSSLMODE === 'require' ? 'require' : true,
  })
} else {
  // Standard PostgreSQL connection (Neon or local)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}

export { pool }
export const db = drizzle(pool, { schema })
