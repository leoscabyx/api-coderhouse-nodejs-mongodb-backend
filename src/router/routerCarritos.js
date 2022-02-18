import { Router } from 'express'

import {
    getCarritosController,
    postCarritosController,
    deleteCarritosByIdController,
    getProductosFromCarritosByIdController,
    postProductosFromCarritosByIdController,
    deleteProductosFromCarritosById
} from '../controladores/controladorCarritos.js'

const router = Router();

router.get('/', getCarritosController)

router.post('/',  postCarritosController)

router.delete('/:id', deleteCarritosByIdController)

router.get('/:id/productos', getProductosFromCarritosByIdController)

router.post('/:id/productos', postProductosFromCarritosByIdController)

router.delete('/:id/productos/:id__prod', deleteProductosFromCarritosById)


export default router