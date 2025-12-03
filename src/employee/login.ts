import type { Context } from 'hono'
import type { Env } from '../index'

export async function loginHandler(c: Context<Env>) {
  const body = await c.req.json()
  const { lineUserId, name, token } = body

  if (!lineUserId) {
    return c.json({ error: "lineUserId is required" }, 400)
  }

  // 查詢是否已存在員工
  const employee = await c.env.DB
    .prepare("SELECT * FROM employees WHERE line_id = ?")
    .bind(lineUserId)
    .first()

  // 如果不存在，預設 disabled
  if (!employee) {
    await c.env.DB.prepare(`
      INSERT INTO employees (line_id, name, status)
      VALUES (?, ?, ?)
    `)
	.bind(lineUserId, name ?? "", "disabled")
	.run();
  }

  return c.json({ ok: true })
}
