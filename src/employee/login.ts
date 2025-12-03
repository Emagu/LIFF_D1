import type { Env } from '../index'

export default async function Login(request: Request, env: Env) {
  const body = await request.json()

  const { lineUserId, name, pictureUrl } = body

  if (!lineUserId) {
    return new Response(JSON.stringify({ error: "lineUserId is required" }), { status: 400 })
  }

  // 查詢是否已存在員工
  const employee = await env.DB.prepare(
    "SELECT * FROM employees WHERE lineId = ?"
  ).bind(lineUserId).first()

  // 如果不存在，預設 disabled
  if (!employee) {
    await env.DB.prepare(`
      INSERT INTO employees (lineId, name, token, status)
      VALUES (?, ?, ?, "disabled")
    `)
    .bind(lineUserId, name ?? "", crypto.randomUUID())
    .run()
  }

  return new Response(JSON.stringify({ ok: true }))
}
