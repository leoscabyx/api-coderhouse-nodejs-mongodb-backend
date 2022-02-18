import { Router } from 'express'
import multer from 'multer'

import {
    getProductosController,
    getProductosByIdController,
    postProductosController,
    updatedProductosController,
    deleteProductosController
} from '../controladores/controladorProductos.js'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})

const upload = multer({ storage })

const router = Router();

router.get('/', getProductosController)

router.get('/:id', getProductosByIdController)

router.post('/', upload.single('thumbnail'), postProductosController)

router.put('/:id', updatedProductosController)

router.delete('/:id', deleteProductosController)

export default router
