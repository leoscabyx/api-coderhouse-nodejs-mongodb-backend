import ContenedorMongoDB from "../../contenedores/ContenedorMongoDB.js"
import sendMail from '../../nodemailer/index.js'
import config from '../../config.js'

class CarritosDaoMongoDB extends ContenedorMongoDB {

    constructor() {
        super('carritos', {
            id: { type: Number, required: true },
            idUser: { type: Number },
            timestamp: { type: Date, required: true },
            productos: { type: Array, required: true },
        })
    }

    /* Enviar mail cuando un usuario finaliza compra */

    async notificarCarrito(dataCarrito, dataUser){
        const items = dataCarrito.productos.map(item => {
            return `<li>${item.title} - Precio: ${item.price} * Cantidad: ${item.cantidad} = $ ${item.price * item.cantidad} </li>`
        })
        const body = `
                    <h2>Listado de Productos</h2>
                    <ul>
                        ${items.join('')}
                    </ul>
                    `
                    
        await sendMail({
            to: config.MAIL_ADMIN,
            subject: `Nuevo Pedido de ${dataUser.email}  (APP)`,
            html: body
                
        })

        await sendMail({
            to: dataUser.email,
            subject: `Detalle de tu Pedido (APP)`,
            html: body
                
        })

    }

    /* Obtener el carrito asociado a un usuario */
    async getCarritoUser(idUser){
        try {
            const obtenerCarrito = await this.coleccion.findOne({idUser: idUser})
            if (obtenerCarrito) {
                return obtenerCarrito
            }else{
                return null
            } 
        } catch (error) {
            logger.error(error)
        }
    }

    /* Listar todos los productos en el carrito pasado el id del carrito solamente */
    async getProductsById(id){
        try {
            const obtenerCarrito = await this.getById(id)
            if(obtenerCarrito){
                return obtenerCarrito.productos
            }else{
                return null
            }
        } catch (error) {
            logger.error(error)
        }
    }

    /* Agregar un producto al carrito pasado el id de carrito */
    async saveProduct(id, product){
        try {
            const [ data ] = await this.coleccion.find({ id: id }, { productos: 1, "_id": 0 })
            let { productos } = data
            
            const indexProduct = productos.findIndex(item => item.id === product.id)

            if(indexProduct !== -1){
                productos[indexProduct].cantidad++
                
            }else{
                product.cantidad = 1
                productos.push(product)
            }

            await this.coleccion.updateOne({id: id}, { $set: {productos: productos }})
            
            return productos
        } catch (error) {
            logger.error(error)
        }
    }

    /* Eliminar un producto del carrito pasado el id del carrito */
    async deleteProducto(idCarrito, idProducto) {
        try {
            const obtenerCarritos = await this.getAll()
            console.log(obtenerCarritos)
            const indexCarrito = obtenerCarritos.findIndex(item => item.id === idCarrito)
            console.log(indexCarrito)
            if(indexCarrito !== -1) {
                const existProduct = obtenerCarritos[indexCarrito].productos.find( item => item.id === idProducto)
                console.log(existProduct)
                if(existProduct){
                    const productosFiltrados = obtenerCarritos[indexCarrito].productos.filter( item => item.id !== idProducto)
    
                    await this.coleccion.updateOne({id: idCarrito}, { $set: {productos: productosFiltrados }})
            
                    return existProduct
                }else{
                    return null
                }
            }else{
                return null
            }
        } catch (error) {
            logger.error(error)
        }
    }
}

export default CarritosDaoMongoDB