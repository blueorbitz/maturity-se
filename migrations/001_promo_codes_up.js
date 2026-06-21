// Promo Code Credit System Migration
// Run: node migrations/001_promo_codes_up.js

const { readFileSync } = require('fs')
const { resolve } = require('path')

// Load .env files (mimics Next.js env loading)
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

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "promo_codes" (
        "id" text PRIMARY KEY,
        "code" text NOT NULL UNIQUE,
        "generations" integer NOT NULL,
        "expiresAt" timestamp NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS "promo_code_redemptions" (
        "id" text PRIMARY KEY,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
        "promoCodeId" text NOT NULL REFERENCES "promo_codes"("id") ON DELETE cascade,
        "redeemedAt" timestamp NOT NULL DEFAULT now()
      )
    `)

    await client.query('COMMIT')
    console.log('Migration 001_promo_codes Up complete.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
