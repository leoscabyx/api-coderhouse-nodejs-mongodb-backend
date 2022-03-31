import { instanciasDaos } from '../daos/index.js'
import logger from '../logger.js'

const DaoProductos = instanciasDaos.DaoProductos 

async function getProductosController(req, res) {
    try {
        const productos = await DaoProductos.getAll()
        res.status(200).json({msj: 'Todos los productos', productos})
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

async function getProductosByIdController(req, res){
    try {
        const id = parseInt(req.params.id)
        const productos = await DaoProductos.getAll()
        const arraysID = productos.map(prod => prod.id)
    
        if (isNaN(id)) {
            return res.status(401).json({ error: 'El ID no es un numero' })
        }
    
        if (!arraysID.includes(id)) {
            return res.status(404).json({ error: 'El ID esta fuera del rango o no existe' })
        }
    
        const producto = await DaoProductos.getById(id)
        console.log(producto)
    
        res.status(200).json({msj: 'Producto por su ID', producto})
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

async function postProductosController(req, res, next) {
    try {
        if(req.user.rol !== 'admin') { return res.status(403).json({ error: "No eres administrador"})}
        const file = req.file
        let thumbnail = null

        if(file){
            const { filename } = req.file
            // thumbnail = "http://localhost:8080/uploads/" + filename
            thumbnail = `${req.protocol}://${req.get('host')}/uploads/${filename}`
        }else if (req.body.thumbnail) {
            thumbnail = req.body.thumbnail
        }else{
            const error = new Error('Please upload a file')
            error.httpStatusCode = 400
            return next(error)
        }
    
        const body = req.body

        const id = await DaoProductos.save({ ...body, thumbnail })

        res.status(201).send({ msj: 'Se ha creado un nuevo producto y se devuelve su ID', id })
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

async function updatedProductosController(req, res, next) {
    try {
        if(req.user.rol !== 'admin') { return res.status(403).json({ error: "No eres administrador"})}
        const id  = parseInt(req.params.id)
        const body = req.body
        const productos = await DaoProductos.getAll()
        const arraysID = productos.map(prod => prod.id)
    
        if (isNaN(id)) {
            return res.json({ error: 'El ID no es un numero' })
        }
    
        if (!arraysID.includes(id)) {
            return res.json({ error: 'El ID esta fuera del rango o no existe' })
        }

        const file = req.file
        let thumbnail = null

        if(file){
            const { filename } = req.file
            // thumbnail = "http://localhost:8080/uploads/" + filename
            thumbnail = `${req.protocol}://${req.get('host')}/uploads/${filename}`
        }else if (req.body.thumbnail) {
            thumbnail = req.body.thumbnail
        }else{
            const error = new Error('Please upload a file')
            error.httpStatusCode = 400
            return next(error)
        }
    
        const producto = {
            timestamp: Date.now(),
            ...body,
            thumbnail
        }
        const productoActualizado = await DaoProductos.updateById(producto, id)
    
        res.status(200).json({msj: 'Producto Actualizado', producto: productoActualizado})
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

async function deleteProductosController(req, res) {
    try {
        if(req.user.rol !== 'admin') { return res.status(403).json({ error: "No eres administrador"})}
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
    
        res.status(200).json({msj: 'Producto Eliminado', producto: productoEliminado})
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

export {
    getProductosController,
    getProductosByIdController,
    postProductosController,
    updatedProductosController,
    deleteProductosController
}