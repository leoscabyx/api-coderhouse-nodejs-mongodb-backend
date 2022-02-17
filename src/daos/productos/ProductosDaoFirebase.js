import ContenedorFirebase from "../../contenedores/ContenedorFirebase.js"

class ProductosDaoFirebase extends ContenedorFirebase {

    constructor() {
        super('productos')
    }

    /* Actualizar un producto segun su id */
    async updateById(producto, id) {
        try {
            const obtenerProductos = await this.getAll()

            if(obtenerProductos && obtenerProductos.length > 0) {
                producto.id = id
                producto.timestamp = Date.now()

                const doc = await this.collection.doc(`${id}`)
                await doc.update({...producto})
                
                return producto
            }else{
                return null
            }
        } catch (error) {
            logger.error(error)
        }
    }
}

export default ProductosDaoFirebase