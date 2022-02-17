import fs from 'fs'

class ContenedorArchivo {
    constructor(archivo = null){
        this.archivo = archivo
    }

    async crearArchivo(){
        try {
            if(!fs.existsSync(this.archivo)){
                await fs.promises.writeFile(this.archivo, JSON.stringify([]))
                logger.info('Archivo TXT creado');
            }
        } catch (error) {
            logger.error(error)
        }
    }

    /* Guardar un nuevo objeto */
    async save(nuevoElemento) {

        await this.crearArchivo()

        try {

            const dataArchivo = await fs.promises.readFile(this.archivo, 'utf-8')
            
            let dataObjeto = null
            if (!dataArchivo) {
                dataObjeto = []
            }else{
                dataObjeto = JSON.parse(dataArchivo)
            }

            if(dataObjeto.length === 0){
                nuevoElemento.id = 1
                
            }else{
                nuevoElemento.id = dataObjeto[dataObjeto.length-1].id + 1
            }

            nuevoElemento.timestamp = Date.now()
            
            dataObjeto.push(nuevoElemento)
            
            await fs.promises.writeFile(this.archivo, JSON.stringify(dataObjeto, null, 2))
            return nuevoElemento.id

        } catch (error) {
            logger.error(error)
        }
        
    }

    /* Recibe un id y devuelve el objeto con ese id, o null si no esta */
    async getById(id) {

        await this.crearArchivo()

        try {
            const data = await this.getAll()
            if(data && data.length > 0) {
                const dataEncontrado = data.find(item => item.id === id)
                if (dataEncontrado) {
                    return dataEncontrado
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

    /* Devuelve un array con los objetos presentes en el archivo */
    async getAll() {   

        await this.crearArchivo()

        try {
            const data = await fs.promises.readFile(this.archivo, 'utf-8')

            if (!data) {
                return null
            }else{
                return JSON.parse(data)
            }
        } catch (error) {
            logger.error(error)
        }
    }

    /* Elimina el objeto con el id buscado */
    async deleteById(id) {

        await this.crearArchivo()

        try {
            const obtenerCarritos = await this.getAll()

            if(obtenerCarritos && obtenerCarritos.length > 0) {
                const carritoEliminado = obtenerCarritos.find(item => item.id === parseInt(id))
                if (carritoEliminado) {
                    const carritos = obtenerCarritos.filter(item => item.id !== parseInt(id))
                    await fs.promises.writeFile(this.archivo, JSON.stringify(carritos, null, 2))

                    return carritoEliminado
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

    /* Elimina todos los objetos presentes en el archivo */
    async deleteAll() {

        await this.crearArchivo()

        try {
            await fs.promises.writeFile(this.archivo, JSON.stringify([], null, 2))
            return 'Archivo vaciado'
        }catch(error){
            logger.error(error)
        }
    }

}

export default ContenedorArchivo;