const { config } = require('dotenv')
config({ path: '.env.development.local' })

const { Pool } = require('pg')
const { Signer } = require('@aws-sdk/rds-signer')
const { awsCredentialsProvider } = require('@vercel/functions/oidc')

console.log('--- AWS Aurora Connection Test ---')
console.log('Command: npx dotenv-cli -e .env.development.local -- node db/test-aurora-connection.js')
console.log('USE_AWS_AURORA:', process.env.USE_AWS_AURORA)
console.log('AWS_AURORA_PGHOST:', process.env.AWS_AURORA_PGHOST)
console.log('AWS_AURORA_PGPORT:', process.env.AWS_AURORA_PGPORT)
console.log('AWS_AURORA_PGDATABASE:', process.env.AWS_AURORA_PGDATABASE)
console.log('AWS_AURORA_PGUSER:', process.env.AWS_AURORA_PGUSER)
console.log('AWS_AURORA_AWS_REGION:', process.env.AWS_AURORA_AWS_REGION)
console.log('AWS_AURORA_PGSSLMODE:', process.env.AWS_AURORA_PGSSLMODE)
console.log('AWS_AURORA_AWS_ROLE_ARN:', process.env.AWS_AURORA_AWS_ROLE_ARN ? 'SET' : 'MISSING')
console.log('VERCEL_OIDC_TOKEN:', process.env.VERCEL_OIDC_TOKEN ? 'SET' : 'MISSING')
console.log('')

async function main() {
  try {
    console.log('1. Creating Signer with OIDC credentials...')
    const signer = new Signer({
      hostname: process.env.AWS_AURORA_PGHOST,
      port: Number(process.env.AWS_AURORA_PGPORT || 5432),
      username: process.env.AWS_AURORA_PGUSER,
      region: process.env.AWS_AURORA_AWS_REGION,
      credentials: awsCredentialsProvider({
        roleArn: process.env.AWS_AURORA_AWS_ROLE_ARN,
        clientConfig: { region: process.env.AWS_AURORA_AWS_REGION },
      }),
    })
    console.log('   Signer created OK')

    console.log('2. Generating IAM auth token...')
    const token = await signer.getAuthToken()
    console.log('   Token generated OK, length:', token.length)

    console.log('3. Creating Pool with password as function...')
    const pool = new Pool({
      host: process.env.AWS_AURORA_PGHOST,
      port: Number(process.env.AWS_AURORA_PGPORT || 5432),
      database: process.env.AWS_AURORA_PGDATABASE,
      user: process.env.AWS_AURORA_PGUSER,
      password: () => signer.getAuthToken(),
      ssl: { rejectUnauthorized: false },
      max: 20,
    })
    console.log('   Pool created OK')

    console.log('4. Listing all tables...')
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `)
    tables.rows.forEach(r => console.log('   -', r.table_name))

    console.log('5. Selecting from "user" table...')
    const users = await pool.query('SELECT id, name, email, "createdAt" FROM "user" LIMIT 5')
    console.log('   Users:', users.rows.length > 0 ? users.rows : '(empty)')

    console.log('6. Testing pool.connect()...')
    const client = await pool.connect()
    const res = await client.query('SELECT current_database(), current_user')
    console.log('   Connected to:', res.rows[0])
    client.release()

    console.log('7. Closing pool...')
    await pool.end()
    console.log('   Pool closed OK')

    console.log('')
    console.log('=== SUCCESS: All tests passed ===')
  } catch (err) {
    console.error('')
    console.error('=== FAILURE ===')
    console.error('Error type:', err.constructor.name)
    console.error('Error message:', err.message)
    if (err.stack) {
      console.error('Stack trace:')
      console.error(err.stack)
    }
    process.exit(1)
  }
}

main()
