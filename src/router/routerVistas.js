import { Router } from 'express'

import {
    getViewInfo,
    getViewChat,
} from '../controladores/controladorVistas.js'

const router = Router()

router.get('/info', getViewInfo)

router.get('/chat', getViewChat)

export default router