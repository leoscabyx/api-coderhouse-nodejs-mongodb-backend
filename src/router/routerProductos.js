const { Router } = require('express');
const multer = require('multer')

const ContenedorKnex = require('../contenedores/contenedorKnex')
const contenedorProductos = new ContenedorKnex({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : 'leoscabyx',
      password : 'leoscabyx',
      database : 'coderhouse'
    }
}, 'productos')

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

const administrador = true

router.get('/', async (req, res) => {
    const productos = await contenedorProductos.getAll()
    res.json(productos)
    console.log('Devolver todos los productos')
})

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    // console.log(typeof id, id)
    const productos = await contenedorProductos.getAll()
    const arraysID = productos.map(prod => prod.id)
    // console.log(arraysID)

    if (isNaN(id)) {
        return res.json({ error: 'El ID no es un numero' })
    }

    if (!arraysID.includes(id)) {
        console.log('upss')
        return res.json({ error: 'El ID esta fuera del rango' })
    }

    const producto = await contenedorProductos.getById(id)

    res.json(producto)
    console.log('Devolver todos los productos')
})

router.post('/', upload.single('thumbnail'), async (req, res, next) => {
    if (administrador) {
        const file = req.file
        let thumbnail = null
        /* Falta comprobar o validar si no envian la imagen por formulario permitir validar si la estan enviando como json la ruta porque si no siempre me va a dar error al preguntar por req.file ya que la informacion no viene de un formulario */
        /* console.log(file)
        if (!file) {
          const error = new Error('Please upload a file')
          error.httpStatusCode = 400
          return next(error)
        } */
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
        const productoNuevo = {
            timestamp: Date.now(), 
            title,
            description,
            code,
            price: parseFloat(price), 
            thumbnail,
            stock
        }
        console.log(productoNuevo)
        const id = await contenedorProductos.save(productoNuevo)
        res.send({ producto: productoNuevo, id })
    }else{
        res.json({ error : -1, descripcion: `ruta '${req.url}' método ${req.method} no autorizada`})
    }
})

router.put('/:id', async (req, res) => {
    if (administrador) {
        const id  = parseInt(req.params.id)
        const { title, description, code, price, stock, thumbnail } = req.body
        const productos = await contenedorProductos.getAll()
        const arraysID = productos.map(prod => prod.id)
    
        if (isNaN(id)) {
            return res.json({ error: 'El ID no es un numero' })
        }
    
        if (!arraysID.includes(id)) {
            return res.json({ error: 'El ID esta fuera del rango' })
        }
    
        const producto = { title, description, code, price, stock, thumbnail }
        const productoActualizado = await contenedorProductos.updateById(producto, id)
    
        res.json({ productoActualizado, id })
    }else{
        res.json({ error : -1, descripcion: `ruta '${req.url}' método ${req.method} no autorizada`})
    }
})

router.delete('/:id', async (req, res) => {
    if (administrador) {
        const id = parseInt(req.params.id)
    
        const productos = await contenedorProductos.getAll()
        const arraysID = productos.map(prod => prod.id)
    
        if (isNaN(id)) {
            return res.json({ error: 'El ID no es un numero' })
        }
    
        if (!arraysID.includes(id)) {
            return res.json({ error: 'El ID esta fuera del rango' })
        }
    
        const producto = await contenedorProductos.deleteById(id)
    
        res.json(producto)

    }else{
        res.json({ error : -1, descripcion: `ruta '${req.originalUrl}' método ${req.method} no autorizada`})
    }
})

module.exports = router;