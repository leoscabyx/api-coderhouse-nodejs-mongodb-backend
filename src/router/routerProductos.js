import { Router } from 'express'
import upload from '../multer/index.js'

import {
    getProductosController,
    getProductosByIdController,
    postProductosController,
    updatedProductosController,
    deleteProductosController
} from '../controladores/controladorProductos.js'

import { authJWT } from '../jwt/index.js'

const router = Router();

router.get('/', getProductosController)

router.get('/:id', getProductosByIdController)

router.post('/', authJWT, upload.single('thumbnail'), postProductosController)

router.put('/:id', authJWT, upload.single('thumbnail'), updatedProductosController)

router.delete('/:id', authJWT, deleteProductosController)

export default router
