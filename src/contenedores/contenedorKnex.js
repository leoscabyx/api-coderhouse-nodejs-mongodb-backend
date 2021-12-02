import knex from 'knex'

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
                if(this.table === 'productos'){
                    await sql.schema.createTable(table, function(t) {
                        t.increments('id').primary();
                        t.string('timestamp');
                        t.string('title', 80);
                        t.string('description', 160);
                        t.string('code', 10);
                        t.float('price', 20, 2);
                        t.text('thumbnail');
                        t.integer('stock');
                    })
                }

                if(this.table === 'mensajes'){
                    await sql.schema.createTable(table, function(t) {
                        t.increments('id').primary();
                        t.string('fecha');
                        t.string('email', 150);
                        t.text('msj');
                    })
                }
                console.log('Tabla creada', this.table)
                // sql.destroy()
            }
        } catch (error) {
            console.log(error)
        }
    }

    /* Recibe un objeto, lo guarda en el archivo, devuelve el id asignado */
    async save(objetoNuevo) {
        if (typeof objetoNuevo !== 'object') return console.log('El valor esperado es un objeto')
        if (Array.isArray(objetoNuevo)) return console.log('El valor esperado es un objeto clave/valor no un array')
        if (Object.keys(objetoNuevo).length === 0) return console.log('El objeto esta vacio')

        await this.createtable()

        try {
            const sql = knex(this.options)
            const table = this.table

            const hasTable = await sql.schema.hasTable(table);
            
            if(hasTable){
                const [id]  = await sql(table).insert(objetoNuevo)
                
                return id
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
                const registros = await sql.select().table(table)
                return registros
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

            const [elementoEliminado] = await sql(table).where({ id: id })
            const result = await sql(table).where({ id: id }).del()
            console.log(result, elementoEliminado)
            if(result) {
                return elementoEliminado
            }else{
                return null
            }
        } catch (error) {
            console.log(error)
        }
    }

    /* Actualizar un producto segun su id */
    async updateById(objetoActualizado, id) {
        try {
            const sql = knex(this.options)
            const table = this.table

            const result = await sql(table).where({ id: id }).update(objetoActualizado)
            const [productoActualizado] = await sql(table).where({ id: id })

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

export default contenedorKnex
