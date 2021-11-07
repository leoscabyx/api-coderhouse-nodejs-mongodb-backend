const { Router } = require('express');
const multer = require('multer')

const Contenedor = require('../contenedorProductos')
const contenedorProductos = new Contenedor('./src/productos.txt')

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

router.get('/', async (req, res) => {
    const productos = await contenedorProductos.getAll()
    res.json(productos)
    console.log('Devolver todos los productos')
})

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    console.log(typeof id, id)
    const productos = await contenedorProductos.getAll()

    if (isNaN(id)) {
        return res.json({ error: 'El ID no es un numero' })
    }

    if (id < 1 || id > productos.length) {
        console.log('upss')
        return res.json({ error: 'El ID esta fuera del rango' })
    }

    const producto = await contenedorProductos.getById(id)

    res.json(producto)
    console.log('Devolver todos los productos')
})

router.post('/', upload.single('thumbnail'), async (req, res, next) => {
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
        price, 
        thumbnail,
        stock
    }
    const id = await contenedorProductos.save(productoNuevo)
    res.send({ producto: productoNuevo, id })
})

router.put('/:id', async (req, res) => {
    const { id } = req.params
    const { title, description, code, price, stock, thumbnail } = req.body
    const productos = await contenedorProductos.getAll()

    if (isNaN(id)) {
        return res.json({ error: 'El ID no es un numero' })
    }

    if (id < 1 || id > productos.length) {
        return res.json({ error: 'El ID esta fuera del rango' })
    }

    const producto = { title, description, code, price, stock, thumbnail }
    const productoActualizado = await contenedorProductos.updateById(producto, id)

    res.json({ productoActualizado, id })
})

router.delete('/:id', async (req, res) => {
    
    const id = parseInt(req.params.id)
    
    const productos = await contenedorProductos.getAll()

    if (isNaN(id)) {
        return res.json({ error: 'El ID no es un numero' })
    }

    if (id < 1 || id > productos.length) {
        return res.json({ error: 'El ID esta fuera del rango' })
    }

    const producto = await contenedorProductos.deleteById(id)

    res.json(producto)

    // res.send('ok')
})

module.exports = router;