import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

const isProd = process.env.NODE_ENV === 'production'

// Collect every plausible base URL so Better Auth can resolve its own routes.
const productionURL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : null
const previewURL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : null
const runtimeURL = process.env.V0_RUNTIME_URL ?? null

const baseURL =
  process.env.BETTER_AUTH_URL ??
  productionURL ??
  previewURL ??
  runtimeURL ??
  'http://localhost:3000'

// Trusted origins: in production only known domains; in dev allow everything
// so the v0 preview iframe (any *.v0.run origin) is never blocked.
const trustedOrigins = isProd
  ? [
      ...(productionURL ? [productionURL] : []),
      ...(previewURL ? [previewURL] : []),
      'http://localhost:3000',
    ]
  : ['*']

console.log('isProd', isProd);
console.log('trustedOrigins', trustedOrigins);
console.log('previewURL', previewURL);
console.log('runtimeURL', runtimeURL);

export const auth = betterAuth({
  database: pool,
  baseURL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // 1 day
  },
  advanced: {
    // In the v0 preview the app runs inside a cross-origin iframe.
    // Without sameSite:"none" the browser silently drops the session cookie.
    // disableCSRFCheck lets any origin POST to the auth endpoints in dev/preview.
    defaultCookieAttributes: isProd
      ? {}
      : { sameSite: 'none' as const, secure: true },
    ...(isProd ? {} : { disableCSRFCheck: true }),
  },
})
