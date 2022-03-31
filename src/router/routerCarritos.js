import { Router } from 'express'

import {
    getCarritosController,
    postCarritosController,
    deleteCarritosByIdController,
    getProductosFromCarritosByIdController,
    postProductosFromCarritosByIdController,
    deleteProductosFromCarritosById,
    checkoutCarrito
} from '../controladores/controladorCarritos.js'

import { authJWT } from '../jwt/index.js'

const router = Router();

router.get('/', authJWT, getCarritosController)

router.post('/', authJWT,  postCarritosController)

router.delete('/:id', authJWT, deleteCarritosByIdController)

router.get('/:id/productos', authJWT, getProductosFromCarritosByIdController)

router.post('/:id/productos/:id__prod', authJWT, postProductosFromCarritosByIdController)

router.delete('/:id/productos/:id__prod', authJWT, deleteProductosFromCarritosById)

router.post('/:id/checkout', authJWT, checkoutCarrito)


export default router