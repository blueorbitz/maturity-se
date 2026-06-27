const { execSync } = require('child_process')
const fs = require('fs')
const { config } = require('dotenv')
const { Signer } = require('@aws-sdk/rds-signer')
const { awsCredentialsProvider } = require('@vercel/functions/oidc')

const envFile = '.env.development.local'
const args = process.argv.slice(2).join(' ')

if (fs.existsSync(envFile)) {
  config({ path: envFile })
}

const useAWSAurora = process.env.USE_AWS_AURORA === 'true'

async function main() {
  let command = args
  let env = { ...process.env }

  if (useAWSAurora) {
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

    const authToken = await signer.getAuthToken()

    env.DATABASE_URL = `postgresql://${encodeURIComponent(process.env.AWS_AURORA_PGUSER)}:${encodeURIComponent(authToken)}@${process.env.AWS_AURORA_PGHOST}:${process.env.AWS_AURORA_PGPORT || 5432}/${process.env.AWS_AURORA_PGDATABASE}?sslmode=${process.env.AWS_AURORA_PGSSLMODE || 'require'}`
  }

  execSync(command, { stdio: 'inherit', shell: true, env })
}

main()
