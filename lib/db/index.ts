import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { attachDatabasePool } from '@vercel/functions'
import * as schema from './schema'

const useAWSAurora = process.env.USE_AWS_AURORA === 'true'

let pool: Pool

if (useAWSAurora) {
  const signer = new Signer({
    hostname: process.env.AWS_AURORA_PGHOST!,
    port: Number(process.env.AWS_AURORA_PGPORT || 5432),
    username: process.env.AWS_AURORA_PGUSER!,
    region: process.env.AWS_AURORA_AWS_REGION!,
    credentials: awsCredentialsProvider({
      roleArn: process.env.AWS_AURORA_AWS_ROLE_ARN!,
      clientConfig: { region: process.env.AWS_AURORA_AWS_REGION! },
    }),
  })

  pool = new Pool({
    host: process.env.AWS_AURORA_PGHOST,
    port: Number(process.env.AWS_AURORA_PGPORT || 5432),
    database: process.env.AWS_AURORA_PGDATABASE,
    user: process.env.AWS_AURORA_PGUSER,
    password: () => signer.getAuthToken(),
    ssl: { rejectUnauthorized: false },
    max: 20,
  })

  attachDatabasePool(pool)
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}

export { pool }
export const db = drizzle(pool, { schema })
