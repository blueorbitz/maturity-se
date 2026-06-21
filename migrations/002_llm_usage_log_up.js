// LLM Usage Log & Default LLM Mode Migration
// Run: node migrations/002_llm_usage_log_up.js

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

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Add default_llm_mode column to user table
    await client.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS "defaultLlmMode" text NOT NULL DEFAULT 'own_key'
    `)

    // Create llm_usage_log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "llm_usage_log" (
        "id" text PRIMARY KEY,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
        "feature" text NOT NULL DEFAULT 'template_generation',
        "provider" text NOT NULL,
        "model" text,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `)

    // Add unique constraint on promo_code_redemptions if not exists
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "promo_code_redemptions"
        ADD CONSTRAINT "promo_code_redemptions_user_code_unique"
        UNIQUE ("userId", "promoCodeId");
      EXCEPTION
        WHEN duplicate_table THEN NULL;
      END $$;
    `)

    await client.query('COMMIT')
    console.log('Migration 002_llm_usage_log Up complete.')
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
