import ContenedorMongoDB from "../../contenedores/ContenedorMongoDB.js"

class CarritosDaoMongoDB extends ContenedorMongoDB {

    constructor() {
        super('carritos', {
            id: { type: Number, required: true },
            timestamp: { type: Date, required: true },
            productos: { type: Array, required: true },
        })
    }

    /* Listar todos los productos en el carrito pasado por id */
    async getProductsById(id){
        try {
            const obtenerCarrito = await this.getById(id)
            if(obtenerCarrito){
                return obtenerCarrito.productos
            }else{
                return null
            }
        } catch (error) {
            console.log(error)
        }
    }

    /* Agregar un producto al carrito pasado el id de carrito */
    async saveProduct(id, product){
        try {
            const [ data ] = await this.coleccion.find({id: id}, {productos: 1, "_id": 0})
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
            console.log(error)
        }
    }

    /* Eliminar un producto del carrito pasado el id del carrito */
    async deleteProducto(idCarrito, idProducto) {
        try {
            const obtenerCarritos = await this.getAll()

            const indexCarrito = obtenerCarritos.findIndex(item => item.id === idCarrito)
    
            if(indexCarrito !== -1) {
                const existProduct = obtenerCarritos[indexCarrito].productos.find( item => item.id === idProducto)

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
            console.log(error)
        }
    }
}

export default CarritosDaoMongoDB