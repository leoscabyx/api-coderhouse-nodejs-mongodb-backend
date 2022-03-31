import { instanciasDaos } from '../daos/index.js'
import logger from '../logger.js'

const DaoCarritos = instanciasDaos.DaoCarritos
const DaoProductos = instanciasDaos.DaoProductos 
const DaoUsuarios = instanciasDaos.DaoUsuarios 

async function getCarritosController(req, res) {
    try {
        if(req.user.rol !== 'admin') { return res.status(403).json({ error: "No eres administrador"})}
        const carritos = await DaoCarritos.getAll()

        res.status(200).json({ msj: "Todos los Carritos", carritos })
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

async function postCarritosController(req, res) {
    try {
        const { productos } = req.body

        const carrito = await DaoCarritos.getCarritoUser(req.user.id)
    
        if(carrito) {
            return res.status(401).json({ msj: 'Ya tienes un carrito', id: carrito.id })
        }
    
        if(Array.isArray(productos) && productos.length === 0){
            const idCarrito = await DaoCarritos.save({productos, idUser: req.user.id})
    
            res.status(201).json({ msj: 'Se ha creado un nuevo carrito y se devuelve su ID', id: idCarrito })
        }else{
            res.json({ msj: 'Se debe enviar un objeto con la propiedad productos y array vacio' })
        }
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

async function deleteCarritosByIdController(req, res) {
    try {
        if(req.user.rol !== 'admin') { return res.status(403).json({ error: "No eres administrador"})}
        const id = parseInt(req.params.id)
    
        const carritos = await DaoCarritos.getAll()
    
        if (isNaN(id)) {
            return res.json({ error: 'El ID no es un numero' })
        }
    
        if (id < 1 || id > carritos.length) {
            return res.json({ error: 'El ID esta fuera del rango' })
        }
    
        const carrito = await DaoCarritos.deleteById(id)
        const data = {
            id: carrito.id,
            idUser: carrito.idUser,
            timestamp: carrito.timestamp,
            productos: carrito.productos
         } 
    
        res.status(200).json({ msj: "Carrito Eliminado", data })
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

async function getProductosFromCarritosByIdController(req, res) {
    try {
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
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

async function postProductosFromCarritosByIdController(req, res) {
    try {
        const id = parseInt(req.params.id)
        const id__prod = parseInt(req.params.id__prod)
    
        const carritos = await DaoCarritos.getAll()
    
        if (isNaN(id)) {
            return res.json({ error: 'El ID no es un numero' })
        }
    
        if (id < 1 || id > carritos.length) {
            return res.json({ error: 'El ID esta fuera del rango' })
        }    
        
        const productoDB = await DaoProductos.getById(id__prod)
    
        if (!productoDB) {
            return res.json({ error: 'El id del producto no existe en la base de datos' })
        }

        const { id: idp, title, price, description, thumbnail } = productoDB
        
        const producto = { 
            id: idp, 
            title, price, description, thumbnail,
            timestamp: Date.now() 
        }

        const productosCarrito = await DaoCarritos.saveProduct(id, producto)
    
        res.status(201).json({ msj: "Se ha insertado un producto en el carrito por su ID", data: {id: id, productos: productosCarrito} })
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

async function deleteProductosFromCarritosById(req, res) {
    try {
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
        console.log(productoEliminado)
        if(productoEliminado){
            res.status(200).json({ msj: "Producto Eliminado en el carrito por su ID", producto: productoEliminado })
        }else{
            res.json({ msj: "No se ha podido Eliminar el producto del Carrito por su ID" })
        }
    
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })   
    }
}

/* Finalizar compra */
async function checkoutCarrito(req, res) {
    try {
        const id = parseInt(req.params.id)
        const productosCarrito = await DaoCarritos.getProductsById(id)

        if(!productosCarrito) {
            return res.json({ error: 'No se ha encontrado el carrito para procesar la compra...!' })
        }

        if(productosCarrito.length === 0){
            return res.json({ error: 'Aun no tienes productos en el carrito para finalizar la compra' })
        }
        
        const carrito = await DaoCarritos.deleteById(id)
        const ususario = await DaoUsuarios.getById(req.user.id)

        await DaoCarritos.notificarCarrito(carrito, { email: ususario.email })
        res.status(200).json({msj: "Gracias por tu compra... 🙌 se ha enviado un mail con tu pedido"})
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })  
    }
}

export {
    getCarritosController,
    postCarritosController,
    deleteCarritosByIdController,
    getProductosFromCarritosByIdController,
    postProductosFromCarritosByIdController,
    deleteProductosFromCarritosById,
    checkoutCarrito
}