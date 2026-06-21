// Seed a test promo code
// Run: node migrations/001_promo_codes_seed.js

const { readFileSync } = require('fs')
const { resolve } = require('path')

function loadEnv() {
  const files = ['.env', '.env.local', '.env.development', '.env.development.local']
  for (const file of files) {
    try {
      const content = readFileSync(resolve(__dirname, '..', file), 'utf8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIndex = trimmed.indexOf('=')
        if (eqIndex === -1) continue
        const key = trimmed.slice(0, eqIndex).trim()
        const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = value
      }
    } catch { /* file doesn't exist, skip */ }
  }
}

loadEnv()

const { Pool } = require('pg')
const { nanoid } = require('nanoid')

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()

  try {
    const id = nanoid()
    await client.query(
      `INSERT INTO "promo_codes" ("id", "code", "generations", "expiresAt")
       VALUES ($1, $2, $3, $4)
       ON CONFLICT ("code") DO NOTHING`,
      [id, 'TESTCODE', 5, '2026-12-31']
    )
    console.log('Test promo code created: TESTCODE (5 generations, expires 2026-12-31)')
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
