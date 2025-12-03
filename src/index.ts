// src/index.ts
import { router } from './router'

export interface Env {
  DB: D1Database
  EMPLOYEE_KV: KVNamespace
  SECRET: string
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await router.handle(request, env, ctx)
    } catch (err: any) {
      console.error('Worker Error:', err)
      return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
  }
}
