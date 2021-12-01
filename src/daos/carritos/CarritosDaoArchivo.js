import fs from 'fs'
import ContenedorArchivo from "../../contenedores/ContenedorArchivo.js"

class CarritosDaoArchivo extends ContenedorArchivo {

    constructor(rutaDir) {
        super(`${rutaDir}carrito-db.txt`)
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
            const obtenerCarritos = await this.getAll()

            const indexCarrito = obtenerCarritos.findIndex(item => item.id === id)
    
            const indexProduct = obtenerCarritos[indexCarrito].productos.findIndex(item => item.id === product.id)
    
            if(indexProduct !== -1){
                obtenerCarritos[indexCarrito].productos[indexProduct].cantidad++
            }else{
                product.cantidad = 1
                obtenerCarritos[indexCarrito].productos.push(product)
            }
    
            await fs.promises.writeFile(this.archivo, JSON.stringify(obtenerCarritos, null, 2))
    
            return obtenerCarritos[indexCarrito].productos
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
                    obtenerCarritos[indexCarrito].productos = productosFiltrados
            
                    await fs.promises.writeFile(this.archivo, JSON.stringify(obtenerCarritos, null, 2))
            
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

export default CarritosDaoArchivo