import { Router } from 'express'
import { passport } from '../passport.js'

import {
    getViewRegister,
    redirectViewLogin,
    getViewRegisterFail,
    getViewLogin,
    redirectViewInicio,
    getViewLoginFail,
    getViewLogout
} from '../controladores/controladorAuth.js'

const router = Router()

router.get('/register', getViewRegister)

router.post(
    '/register',
    passport.authenticate('register', { failureRedirect: '/failsignup' }), 
    redirectViewLogin
)

router.get('/failsignup', getViewRegisterFail)

router.get('/login', getViewLogin)

router.post(
    '/login',
    passport.authenticate('login', { failureRedirect: '/faillogin' }), 
    redirectViewInicio
)

router.get('/faillogin', getViewLoginFail)

router.get('/logout', getViewLogout)

export default router