import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import * as schema from './schema'

const isAWSAurora = process.env.AWS_REGION && process.env.RDS_HOSTNAME

let pool: Pool

if (isAWSAurora) {
  // AWS Aurora PostgreSQL with IAM authentication
  const signer = new Signer({
    region: process.env.AWS_REGION!,
    hostname: process.env.RDS_HOSTNAME!,
    port: Number(process.env.RDS_PORT || 5432),
    username: process.env.RDS_USERNAME!,
  })

  pool = new Pool({
    host: process.env.RDS_HOSTNAME,
    port: Number(process.env.RDS_PORT || 5432),
    database: process.env.RDS_DATABASE,
    user: process.env.RDS_USERNAME,
    password: signer.getAuthToken({
      username: process.env.RDS_USERNAME!,
    }),
    ssl: 'require',
  })
} else {
  // Standard PostgreSQL connection (Neon or local)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}

export { pool }
export const db = drizzle(pool, { schema })
