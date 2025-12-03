// src/router.ts
import { Router } from 'itty-router'
import liffHtml from './public/index.html'
// 各 action
//import Login from './employee/login'

const router = Router()

// 掛載 route
//router.post('/api/employee/login', Login);
router.get('/', ()=> {
	return new Response(liffHtml, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' }
	});
});
// export 出去讓 index.ts 使用
export { router }
