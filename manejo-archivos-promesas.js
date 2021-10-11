const fs = require('fs')

class Contenedor {
    constructor(archivo = null){
        this.archivo = archivo
    }

    async crearArchivo(){
        try {
            await fs.promises.writeFile(this.archivo, JSON.stringify([]))
        } catch (error) {
            
        }
    }

    /* Recibe un objeto, lo guarda en el archivo, devuelve el id asignado */
    async save(producto) {
        if (typeof producto !== 'object') return console.log('El valor esperado es un objeto')
        if (Array.isArray(producto)) return console.log('El valor esperado es un objeto clave/valor no un array')
        if (Object.keys(producto).length === 0) return console.log('El objeto esta vacio')
        if (!producto.hasOwnProperty('title') && !producto.hasOwnProperty('price') && !producto.hasOwnProperty('thumbnail')) return console.log('El objeto con el nuevo producto debe tener: title, price y thumbnail')
        
        fs.access(this.archivo, (error) => {
            console.log(error)
            if (error){
                console.error('File does not exist');
                this.crearArchivo()
            } else {
                console.log('File does exist');
            }
        })
        

        try {
            const data = await fs.promises.readFile(this.archivo, 'utf-8')

            let dataObjeto = null
            if (!data) {
                dataObjeto = []
            }else{
                dataObjeto = JSON.parse(data)
            }
            if(dataObjeto.length === 0){
                producto.id = 1
            }else{
                producto.id = dataObjeto[dataObjeto.length-1].id + 1
            }
            
            dataObjeto.push(producto)
            /* console.log(dataObjeto)
            console.log(JSON.stringify(dataObjeto)) */
            await fs.promises.writeFile(this.archivo, JSON.stringify(dataObjeto, null, 2))
            return producto.id
        } catch (error) {
            console.log(error)
        }
            
    }
    /* Recibe un id y devuelve el objeto con ese id, o null si no esta */
    async getById(id) {
        const obtenerProductos = await this.getAll()
        if(obtenerProductos && obtenerProductos.length > 0) {
            const productoEncontrado = obtenerProductos.find(item => item.id === id)
            return productoEncontrado
        }else{
            return null
        }
    }
    /* Devuelve un array con los objetos presentes en el archivo */
    async getAll() {   
        try {
            const data = await fs.promises.readFile(this.archivo, 'utf-8')

            if (!data) {
                return null
            }else{
                return JSON.parse(data)
            }
        } catch (error) {
            console.log(error)
        }
    }
    /* Elimina del archivo el objeto con el id buscado */
    async deleteById(id) {
        const obtenerProductos = await this.getAll()
        /* console.log(Array.isArray(obtenerProductos))
        console.log(obtenerProductos.filter(item => item.id !== id))
        return */
        if(obtenerProductos && obtenerProductos.length > 0) {
            const productos = obtenerProductos.filter(item => item.id !== id)
            await fs.promises.writeFile(this.archivo, JSON.stringify(productos, null, 2))
            return obtenerProductos.find(item => item.id === id)
        }else{
            return null
        }
    }
    /* Elimina todos los objetos presentes en el archivo */
    async deleteAll() {
        try {
            await fs.promises.writeFile(this.archivo, JSON.stringify([], null, 2))
        }catch(error){
            console.log(error)
        }
    }

}

/* const contenedorProductos = new Contenedor('./productos.txt') */

/* const nuevoProducto = {
    title: 'Producto X',
    price: 1000,
    thumbnail: 'https://coder-conf.com/_nuxt/img/astronauta.84dff61.png'
} */


/* contenedorProductos.save(nuevoProducto).then(data => console.log(data)) */ 
/* contenedorProductos.getAll().then(data => console.log(data)) */
/* contenedorProductos.getById(2).then(data => console.log(data)) */
/* contenedorProductos.deleteById(2).then(data => console.log(data)) */


module.exports = Contenedor
/* export default Contenedor Hay que convertirlo con babel */