import { Hono } from 'hono'
import { loginHandler } from './employee/login'

export interface Env {
  DB: D1Database
  ASSETS: Fetcher // 若你有 assets
}

const app = new Hono<Env>()

// API routes
app.post('/api/employee/login', loginHandler)

// 靜態資源（若你用 Cloudflare ASSETS）
app.get('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
