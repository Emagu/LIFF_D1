// worker/index.js
// Cloudflare Worker (module)
// Removed itty-router import; using native routing instead
const router = Router();

// 假設你已經在帳戶中建立了 D1 binding 名為 DB
// 透過 KV 或 D1 來儲存資料。此範例用 D1。


// Helper: parse JSON body
async function json(req){
	try
	{
		return await req.json();
	}
	catch(e)
	{
		return null;
	}
}


// POST /api/employees/login
// 由 LIFF 前端送來 lineId, displayName。若不存在則建立（status = 'disabled')
router.post('/api/employees/login', async (request, env) => {
	const body = await json(request);
	if (!body || !body.lineId) 
		return new Response(JSON.stringify({message:'missing lineId'}), {status:400});


	const lineId = body.lineId;
	const displayName = body.displayName || '';


	// 檢查是否存在
	const existing = await env.DB.prepare('SELECT id, lineId, displayName, status FROM employees WHERE lineId = ?').bind(lineId).first();
	if (existing) {
		return new Response(JSON.stringify({employeeId: existing.id, lineId: existing.lineId, displayName: existing.displayName, status: existing.status}), {status:200});
	}


	// 若不存在則建立，預設 disabled
	const ins = await env.DB.prepare('INSERT INTO employees (lineId, displayName, status, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').bind(lineId, displayName, 'disabled').run();
	const id = ins.lastInsertRowid;
	return new Response(JSON.stringify({employeeId: id, lineId, displayName, status: 'disabled'}), {status:201});
});


// GET /api/beds?employeeId=xxx
// 回傳該員工可見的植床列表
router.get('/api/beds', async (request, env) => {
const url = new URL(request.url);
const employeeId = url.searchParams.get('employeeId');
if (!employeeId) return new Response(JSON.stringify([]), {status:200});


// 簡單檢查員工是否 enabled
const emp = await env.DB.prepare('SELECT status FROM employees WHERE id = ?').bind(employeeId).first();
if (!emp || emp.status !== 'enabled') return new Response(JSON.stringify([]), {status:200});


const rows = await env.DB.prepare('SELECT id, name, description FROM beds').all();
return new Response(JSON.stringify(rows.results || []), {status:200});
});


// GET /api/beds/:id/batches
router.get('/api/beds/:id/batches', async ({ params }, env) => {
const id = params.id;
const rows = await env.DB.prepare('SELECT id, bed_id, batch_code, species, quantity FROM batches WHERE bed_id = ?').bind(id).all();
return new Response(JSON.stringify(rows.results || []), {status:200});
});



// GET /api/actions
router.get('/api/actions', async (request, env) => {
const rows = await env.DB.prepare('SELECT id, name, cost, note FROM actions ORDER BY id').all();
return new Response(JSON.stringify(rows.results || []), {status:200});
});


// POST /api/actions/execute
router.post('/api/actions/execute', async (request, env) => {
const body = await json(request);
if (!body) return new Response(JSON.stringify({message:'bad request'}), {status:400});
// For prototype: just insert a record into actions_log
await env.DB.prepare('INSERT INTO actions_log (bed_id, action_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)').bind(body.bedId, body.actionId).run();
return new Response(JSON.stringify({message:'action executed'}), {status:200});
});


// fallback
router.all('*', () => new Response('Not found', {status:404}));


export default {
async fetch(request, env) {
return router.handle(request, env);
}
};