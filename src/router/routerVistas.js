import { Router } from 'express'

import {
    getViewInicio,
    getViewProductos,
    getViewCarrito,
    postViewCarrito,
    getViewCheckout,
    getViewPerfil
} from '../controladores/controladorVistas.js'

const router = Router()

function isAuth (req, res, next) {
    if(!req.user){
        res.redirect('/login')
    }else{
        next()
    }
}

router.get('/', isAuth, getViewInicio)

router.get('/productos', isAuth, getViewProductos)

router.get('/carrito', isAuth, getViewCarrito)

router.post('/carrito', isAuth, postViewCarrito)

router.get('/checkout', isAuth, getViewCheckout)

router.get('/perfil', isAuth, getViewPerfil)

export default router