import { Router } from 'express'
import multer from 'multer'

import { instanciasDaos } from '../daos/index.js'

const DaoProductos = instanciasDaos.DaoProductos 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
const upload = multer({ storage })

const router = Router();

/* Cambiar a false para probar algunas rutas no autorizadas (Post, Put y Delete) */
const administrador = true

router.get('/', async (req, res) => {
    const productos = await DaoProductos.getAll()
    res.json({msj: 'Todos los productos', productos})
    // console.log('Get /api/productos')
})

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const productos = await DaoProductos.getAll()
    const arraysID = productos.map(prod => prod.id)

    if (isNaN(id)) {
        return res.json({ error: 'El ID no es un numero' })
    }

    if (!arraysID.includes(id)) {
        return res.json({ error: 'El ID esta fuera del rango o no existe' })
    }

    const producto = await DaoProductos.getById(id)

    res.json({msj: 'Producto por su ID', producto})
    // console.log('Get /api/productos/:id')
})

router.post('/', upload.single('thumbnail'), async (req, res, next) => {
    if (administrador) {
        const file = req.file
        let thumbnail = null
        /* Tengo una Duda: Como comprobar o validar si no envian la imagen por formulario permitir validar si la estan enviando como json la ruta porque si no siempre me va a dar error al preguntar por req.file ya que la informacion no viene de un formulario */
        if(file){
            const { filename } = req.file
            thumbnail = "http://localhost:8080/uploads/" + filename
        }else if (req.body.thumbnail) {
            thumbnail = req.body.thumbnail
        }else{
            const error = new Error('Please upload a file')
            error.httpStatusCode = 400
            return next(error)
        }
    
        const { title, description, code, price, stock } = req.body

        const id = await DaoProductos.save({ title, description, code, price: parseFloat(price), thumbnail, stock })

        res.send({ msj: 'Se ha creado un nuevo producto y se devuelve su ID', id })
    }else{
        res.json({ error : -1, descripcion: `ruta '${req.url}' método ${req.method} no autorizada`})
    }
    // console.log('Post /api/productos')
})

router.put('/:id', async (req, res) => {
    if (administrador) {
        const id  = parseInt(req.params.id)
        const { title, description, code, price, stock, thumbnail } = req.body
        const productos = await DaoProductos.getAll()
        const arraysID = productos.map(prod => prod.id)
    
        if (isNaN(id)) {
            return res.json({ error: 'El ID no es un numero' })
        }
    
        if (!arraysID.includes(id)) {
            return res.json({ error: 'El ID esta fuera del rango o no existe' })
        }
    
        const producto = {
            timestamp: Date.now(),
            title,
            description,
            code,
            price,
            stock,
            thumbnail }
        const productoActualizado = await DaoProductos.updateById(producto, id)
    
        res.json({msj: 'Producto Actualizado', producto: productoActualizado})
    }else{
        res.json({ error : -1, descripcion: `ruta '${req.url}' método ${req.method} no autorizada`})
    }
    // console.log('Put /api/productos/:id')
})

router.delete('/:id', async (req, res) => {
    if (administrador) {
        const id = parseInt(req.params.id)
    
        const productos = await DaoProductos.getAll()
        const arraysID = productos.map(prod => prod.id)
    
        if (isNaN(id)) {
            return res.json({ error: 'El ID no es un numero' })
        }
    
        if (!arraysID.includes(id)) {
            return res.json({ error: 'El ID esta fuera del rango o no existe' })
        }
    
        const productoEliminado = await DaoProductos.deleteById(id)
    
        res.json({msj: 'Producto Eliminado', producto: productoEliminado})

    }else{
        res.json({ error : -1, descripcion: `ruta '${req.originalUrl}' método ${req.method} no autorizada`})
    }
    // console.log('Delete /api/productos/:id')
})

export default router
