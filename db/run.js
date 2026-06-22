const { execSync } = require('child_process')
const fs = require('fs')
const { Signer } = require('@aws-sdk/rds-signer')

const envFile = '.env.development.local'
const args = process.argv.slice(2).join(' ')

// Check if using AWS Aurora
const isAWSAurora = process.env.AWS_AURORA_PGHOST && process.env.AWS_AURORA_PGUSER

let command = args
let env = { ...process.env }

if (isAWSAurora) {
  // Generate IAM auth token for AWS Aurora
  const signer = new Signer({
    region: process.env.AWS_AURORA_AWS_REGION,
    hostname: process.env.AWS_AURORA_PGHOST,
    port: Number(process.env.AWS_AURORA_PGPORT || 5432),
    username: process.env.AWS_AURORA_PGUSER,
  })

  const authToken = signer.getAuthToken({
    username: process.env.AWS_AURORA_PGUSER,
  })

  // Construct connection string for dbmate with IAM auth
  env.DATABASE_URL = `postgresql://${process.env.AWS_AURORA_PGUSER}:${authToken}@${process.env.AWS_AURORA_PGHOST}:${process.env.AWS_AURORA_PGPORT || 5432}/${process.env.AWS_AURORA_PGDATABASE}?sslmode=${process.env.AWS_AURORA_PGSSLMODE || 'require'}`
}

if (fs.existsSync(envFile)) {
  execSync(`dotenv -e ${envFile} -- ${command}`, { stdio: 'inherit', env })
} else {
  execSync(command, { stdio: 'inherit', shell: true, env })
}
