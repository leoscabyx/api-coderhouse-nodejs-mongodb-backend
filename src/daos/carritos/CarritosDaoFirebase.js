import ContenedorFirebase from "../../contenedores/ContenedorFirebase.js"

class CarritosDaoFirebase extends ContenedorFirebase {

    constructor() {
        super('carritos')
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
            const carrito = await this.getById(id)
            if(carrito){
                const indexProduct = carrito.productos.findIndex(item => item.id === product.id)
                const doc = await this.collection.doc(`${id}`)
        
                if(indexProduct !== -1){     
                    carrito.productos[indexProduct].cantidad++   
                }else{
                    product.cantidad = 1
                    carrito.productos.push(product)
                }
        
                await doc.update({productos: carrito.productos})
                
                return carrito.productos
            }else{
                return null
            }
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
    
                    const doc = await this.collection.doc(`${idCarrito}`)
                    await doc.update({productos: productosFiltrados})
            
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

export default CarritosDaoFirebase