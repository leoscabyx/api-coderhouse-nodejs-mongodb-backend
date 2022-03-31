import { Router } from 'express'
import upload from '../multer/index.js'

import {
    postLoginController,
    postRegisterController,
    getUsers
} from '../controladores/controladorAuth.js'

const router = Router()

router.post(
    '/register', 
    upload.single('avatar'),
    postRegisterController
)

router.post(
    '/login',
    postLoginController
)

router.get(
    '/',
    getUsers
)

export default router