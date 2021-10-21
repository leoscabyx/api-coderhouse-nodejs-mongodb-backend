const { Router } = require('express');
const multer = require('multer')

const Contenedor = require('../manejo-archivos-promesas')
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

// app.post('/uploadfile', upload.single('thumbnail'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//     const error = new Error('Please upload a file')
//     error.httpStatusCode = 400
//     return next(error)
//     }
//     res.send(file)
// })

const router = Router();

router.get('/', async (req, res) => {
    const productos = await contenedorProductos.getAll()

    /* console.log(await contenedorProductos.getAll()) */
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

    /* console.log(await contenedorProductos.getAll()) */
    res.json(producto)
    console.log('Devolver todos los productos')
})

router.post('/', upload.single('thumbnail'), async (req, res, next) => {
    // console.log(req.body)
    // console.log(req.file)
    const file = req.file
    let thumbnail = null
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
    if(file){
        const {filename, destination} = req.file
        thumbnail = "http://localhost:8080/uploads/" + filename
    }else if (req.body.thumbnail) {
        thumbnail = req.body.thumbnail
    }
    // console.log("http://localhost:8080/uploads/" + filename)
    // res.send('Ok')
    const { title, price } = req.body
    const productoNuevo = { title, price, thumbnail }
    const id = await contenedorProductos.save(productoNuevo)
    res.send({ producto: productoNuevo, id })
})

router.put('/:id', async (req, res) => {
    const { id } = req.params
    const { title, price, thumbnail } = req.body
    const productos = await contenedorProductos.getAll()

    if (isNaN(id)) {
        return res.json({ error: 'El ID no es un numero' })
    }

    if (id < 1 || id > productos.length) {
        return res.json({ error: 'El ID esta fuera del rango' })
    }

    const producto = { title, price, thumbnail }
    const productoActualizado = await contenedorProductos.updateById(producto, id)

    res.json({ productoActualizado, id })
})

router.delete('/:id', async (req, res) => {
    const { id } = req.params
    
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