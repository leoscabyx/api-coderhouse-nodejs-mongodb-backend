import { instanciasDaos } from '../daos/index.js'

const DaoProductos = instanciasDaos.DaoProductos 

/* Cambiar a false para probar algunas rutas no autorizadas (Post, Put y Delete) */
const administrador = true

async function getProductosController(req, res) {
    const productos = await DaoProductos.getAll()
    res.status(200).json({msj: 'Todos los productos', productos})
}

async function getProductosByIdController(req, res){
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

    res.status(200).json({msj: 'Producto por su ID', producto})
}

async function postProductosController(req, res, next) {
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

        res.status(201).send({ msj: 'Se ha creado un nuevo producto y se devuelve su ID', id })
    }else{
        res.json({ error : -1, descripcion: `ruta '${req.url}' método ${req.method} no autorizada`})
    }

}

async function updatedProductosController(req, res) {
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
    
        res.status(200).json({msj: 'Producto Actualizado', producto: productoActualizado})
    }else{
        res.json({ error : -1, descripcion: `ruta '${req.url}' método ${req.method} no autorizada`})
    }

}

async function deleteProductosController(req, res) {
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
    
        res.status(200).json({msj: 'Producto Eliminado', producto: productoEliminado})

    }else{
        res.json({ error : -1, descripcion: `ruta '${req.originalUrl}' método ${req.method} no autorizada`})
    }

}

export {
    getProductosController,
    getProductosByIdController,
    postProductosController,
    updatedProductosController,
    deleteProductosController
}