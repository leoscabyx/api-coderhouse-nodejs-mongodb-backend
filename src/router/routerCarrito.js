import { Router } from 'express'

import { instanciasDaos } from '../daos/index.js'

const router = Router();
const DaoCarritos = instanciasDaos.DaoCarritos  

router.get('/', async (req, res) => {
    const carritos = await DaoCarritos.getAll()

    res.json({ msj: "Todos los productos", carritos })

})

router.post('/',  async (req, res) => {
    const { productos } = req.body

    if(Array.isArray(productos) && productos.length === 0){
        const carrito = await DaoCarritos.save({productos})

        res.json({ msj: 'Se ha creado un nuevo carrito y se devuelve su ID', carrito })
    }else{
        res.json({ msj: 'Se debe enviar un objeto con la propiedad productos y array vacio' })
    }
})

router.delete('/:id', async (req, res) => {

    const id = parseInt(req.params.id)
    
    const carritos = await DaoCarritos.getAll()

    if (isNaN(id)) {
        return res.json({ error: 'El ID no es un numero' })
    }

    if (id < 1 || id > carritos.length) {
        return res.json({ error: 'El ID esta fuera del rango' })
    }

    const carrito = await DaoCarritos.deleteById(id)

    res.json({ msj: "Carrito Eliminado", carrito })
})

router.get('/:id/productos', async (req, res) => {

    const id = parseInt(req.params.id)
    
    const carritos = await DaoCarritos.getAll()

    if (isNaN(id)) {
        return res.json({ error: 'El ID no es un numero' })
    }

    if (id < 1 || id > carritos.length) {
        return res.json({ error: 'El ID esta fuera del rango' })
    }

    const productosCarrito = await DaoCarritos.getProductsById(id)

    res.json({ msj: "Productos por su ID de Carrito", data: {id: id, productos: productosCarrito} })
})

router.post('/:id/productos', async (req, res) => {
    const id = parseInt(req.params.id)
    
    const carritos = await DaoCarritos.getAll()

    if (isNaN(id)) {
        return res.json({ error: 'El ID no es un numero' })
    }

    if (id < 1 || id > carritos.length) {
        return res.json({ error: 'El ID esta fuera del rango' })
    }

    const { id: idProducto, title, description, code, price, thumbnail, stock } = req.body
    const producto = {
        id: idProducto,
        timestamp: Date.now(), 
        title,
        description,
        code,
        price, 
        thumbnail,
        stock
    }

    const productosCarrito = await DaoCarritos.saveProduct(id, producto)

    res.json({ msj: "Se ha insertado un producto en el carrito por su ID", data: {id: id, productos: productosCarrito} })
})

router.delete('/:id/productos/:id__prod', async (req, res) => {

    const id = parseInt(req.params.id)
    const id__prod = parseInt(req.params.id__prod)
    
    const carritos = await DaoCarritos.getAll()

    if (isNaN(id)) {
        return res.json({ error: 'El ID no es un numero' })
    }

    if (id < 1 || id > carritos.length) {
        return res.json({ error: 'El ID esta fuera del rango' })
    }

    const productoEliminado = await DaoCarritos.deleteProducto(id, id__prod)

    if(productoEliminado){
        res.json({ msj: "Producto Eliminado en el carrito por su ID", producto: productoEliminado })
    }else{
        res.json({ msj: "No se ha podido Eliminar el producto del Carrito" })
    }
})


export default router