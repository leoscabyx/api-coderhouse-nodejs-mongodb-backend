const knex = require('knex')

class contenedorKnex {
    constructor(options, table){
        this.options = options
        this.table = table 
    }

    async createtable() {
        try {
            const sql = knex(this.options)
            const table = this.table
            
            const hasTable = await sql.schema.hasTable(table);

            if(!hasTable){
                await sql.schema.createTable(table, function(t) {
                    t.increments('id').primary();
                    t.string('timestamp');
                    t.string('title', 80);
                    t.string('description', 160);
                    t.string('code', 10);
                    t.float('price');
                    t.text('thumbnail');
                    t.integer('stock');
                })
                console.log('Tabla creada')
                // sql.destroy()
            }else{
                console.log('Tabla encontrada')
                // sql.destroy()
            }
        } catch (error) {
            console.log(error)
        }
    }

    /* Recibe un objeto, lo guarda en el archivo, devuelve el id asignado */
    async save(producto) {
        if (typeof producto !== 'object') return console.log('El valor esperado es un objeto')
        if (Array.isArray(producto)) return console.log('El valor esperado es un objeto clave/valor no un array')
        if (Object.keys(producto).length === 0) return console.log('El objeto esta vacio')

        await this.createtable()

        try {
            const sql = knex(this.options)
            const table = this.table

            const hasTable = await sql.schema.hasTable(table);
            
            if(hasTable){
                const [id]  = await sql(table).insert(producto)
                
                return id
                // const productos = await sql.select().table(table)
                // console.log(productos, result)
                sql.destroy()
            }
        } catch (error) {
            console.log(error)
        }
    }

    /* Recibe un id y devuelve el objeto con ese id, o null si no esta */
    async getById(id) {
        try {
            const sql = knex(this.options)
            const table = this.table

            const result = await sql(table).where({ id: id })
            // console.log(result)
            if(result && result.length > 0) {
                return result
            }else{
                return null
            }
        } catch (error) {
            console.log(error)
        }
    }

    /* Devuelve un array con los objetos presentes en la DB */
    async getAll() {   
        try {
            const sql = knex(this.options)
            const table = this.table

            const hasTable = await sql.schema.hasTable(table);
            
            if(hasTable){
                const productos = await sql.select().table(table)
                // console.log(productos)
                sql.destroy()
                return productos
            }else{
                return null
            }
                
        } catch (error) {
            console.log(error)
        }
    }

    /* Elimina producto con el id buscado y devuelve el producto eliminado */
    async deleteById(id) {
        try {
            const sql = knex(this.options)
            const table = this.table

            const [productoEliminado] = await sql(table).where({ id: id })
            const result = await sql(table).where({ id: id }).del()
            console.log(result, productoEliminado)
            if(result) {
                return productoEliminado
            }else{
                return null
            }
        } catch (error) {
            console.log(error)
        }
    }

    /* Actualizar un producto segun su id */
    async updateById(producto, id) {
        try {
            const sql = knex(this.options)
            const table = this.table

            const [productoActualizado] = await sql(table).where({ id: id })
            const result = await sql(table).where({ id: id }).update(producto)
            console.log(result, productoActualizado)
            if(result) {
                return productoActualizado
            }else{
                return null
            }
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = contenedorKnex;

const sql = new contenedorKnex({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : 'leoscabyx',
      password : 'leoscabyx',
      database : 'coderhouse'
    }
}, 'productos')


// sql.save({
//     "title": "Producto 11",
//     "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Molestias, provident!",
//     "code": "00AA11",
//     "price": 1111,
//     "thumbnail": "https://coder-conf.com/_nuxt/img/astronauta.84dff61.png",
//     "stock": 11
// })

// sql.getAll()

// sql.getById(1)

// sql.deleteById(5)

// sql.updateById({
//     "title": "Producto 33",
//     "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Molestias, provident!",
//     "code": "00AA33",
//     "price": 3333,
//     "thumbnail": "https://coder-conf.com/_nuxt/img/astronauta.84dff61.png",
//     "stock": 33
// }, 2)
