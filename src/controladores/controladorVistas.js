import { instanciasDaos } from '../daos/index.js'
const DaoUsuarios = instanciasDaos.DaoUsuarios
const DaoProductos = instanciasDaos.DaoProductos
const DaoCarritos = instanciasDaos.DaoCarritos

async function getViewInicio (req, res) {
    if(req.user){
        res.render('index', { page: 'Inicio', auth: true, nombre: req.user.username }) 
    }else{
        res.render('index', { page: 'Inicio', auth: false })
    }
}

async function getViewProductos (req, res) {
    const productos = await DaoProductos.getAll()
    res.render('products', { page: 'Productos', productos })
}

async function getViewCarrito (req, res) {
    const carritoUser = await DaoCarritos.getCarritoUser(req.user.id)
    let productos = []
    if(carritoUser){
        productos = [...carritoUser.productos]
    }

    res.render('cart', { page: 'Carrito', productos })
}

async function postViewCarrito (req, res) {
    const carritoUser = await DaoCarritos.getCarritoUser(req.user.id)
    const { id, title, description, code, price, thumbnail, stock } = await DaoProductos.getById(req.body.idProducto)
    const producto = {
        id,
        timestamp: Date.now(), 
        title,
        description,
        code,
        price, 
        thumbnail,
        stock
    }
    
    if(!carritoUser){
        const idCarritoUser = await DaoCarritos.save({ productos: [], idUser: req.user.id })
        await DaoCarritos.saveProduct(idCarritoUser, producto)
    }else{
        await DaoCarritos.saveProduct(carritoUser.id, producto)
    }

    res.redirect('/productos')
}

async function getViewCheckout (req, res) {
    const dataUser = await DaoUsuarios.getById(req.user.id)
    const carritoUser = await DaoCarritos.getCarritoUser(req.user.id)
    await DaoCarritos.notificarCarrito(carritoUser, dataUser)
    await DaoCarritos.deleteById(carritoUser.id)
    res.render('checkout', { page: 'Checkout', username: req.user.username })
}

async function getViewPerfil (req, res) {
    const dataUser = await DaoUsuarios.getById(req.user.id)
    res.render('profile', { page: 'Perfil', perfil: dataUser })
}

export {
    getViewInicio,
    getViewProductos,
    getViewCarrito,
    postViewCarrito,
    getViewCheckout,
    getViewPerfil
}