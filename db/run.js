const { execSync } = require('child_process')
const fs = require('fs')

const envFile = '.env.development.local'
const args = process.argv.slice(2).join(' ')

if (fs.existsSync(envFile)) {
  execSync(`dotenv -e ${envFile} -- ${args}`, { stdio: 'inherit' })
} else {
  execSync(args, { stdio: 'inherit', shell: true })
}
