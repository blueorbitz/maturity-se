// Rollback Promo Code Credit System Migration
// Run: node migrations/001_promo_codes_down.js

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

async function rollback() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query('DROP TABLE IF EXISTS "promo_code_redemptions"')
    await client.query('DROP TABLE IF EXISTS "promo_codes"')

    await client.query('COMMIT')
    console.log('Migration 001_promo_codes Down complete.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Rollback failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

rollback()
