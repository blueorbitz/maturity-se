const { execSync } = require('child_process')
const fs = require('fs')
const { Signer } = require('@aws-sdk/rds-signer')

const envFile = '.env.development.local'
const args = process.argv.slice(2).join(' ')

// Check if using AWS Aurora
const isAWSAurora = process.env.AWS_REGION && process.env.RDS_HOSTNAME

let command = args
let env = { ...process.env }

if (isAWSAurora) {
  // Generate IAM auth token for AWS Aurora
  const signer = new Signer({
    region: process.env.AWS_REGION,
    hostname: process.env.RDS_HOSTNAME,
    port: Number(process.env.RDS_PORT || 5432),
    username: process.env.RDS_USERNAME,
  })

  const authToken = signer.getAuthToken({
    username: process.env.RDS_USERNAME,
  })

  // Construct connection string for dbmate with IAM auth
  env.DATABASE_URL = `postgresql://${process.env.RDS_USERNAME}:${authToken}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT || 5432}/${process.env.RDS_DATABASE}?sslmode=require`
}

if (fs.existsSync(envFile)) {
  execSync(`dotenv -e ${envFile} -- ${command}`, { stdio: 'inherit', env })
} else {
  execSync(command, { stdio: 'inherit', shell: true, env })
}
