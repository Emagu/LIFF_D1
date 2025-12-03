// src/router.ts
import { Router } from 'itty-router'

// 各 action
import Login from './employee/login'

const router = Router()

// 掛載 route
router.post('/api/employee/login', Login)

// export 出去讓 index.ts 使用
export { router }
