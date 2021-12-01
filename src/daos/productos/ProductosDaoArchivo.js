import fs from 'fs'
import ContenedorArchivo from "../../contenedores/ContenedorArchivo.js"

class ProductosDaoArchivo extends ContenedorArchivo {

    constructor(rutaDir) {
        super(`${rutaDir}productos-db.txt`)
    }

    /* Actualizar un producto segun su id */
    async updateById(producto, id) {
        try {
            const obtenerProductos = await this.getAll()

            if(obtenerProductos && obtenerProductos.length > 0) {
                producto.id = id
                obtenerProductos[id - 1] = producto

                await fs.promises.writeFile(this.archivo, JSON.stringify(obtenerProductos, null, 2))
                return obtenerProductos.find(item => item.id === id)
            }else{
                return null
            }
        } catch (error) {
            console.log(error)
        }
    }
}

export default ProductosDaoArchivo