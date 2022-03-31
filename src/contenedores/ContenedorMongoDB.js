import mongoose from 'mongoose'

import config from '../config.js'
import logger from '../logger.js'

const { Schema } = mongoose;

try {
    await mongoose.connect(config.mongodb.cnxStr, { serverSelectionTimeoutMS: 2000 });
} catch (error) {
    logger.error(`Error Conexion: 'No se pudo conectar a la DB de mongo local o atlas, revisar el servidor de mongodb este iniciado'`);
}

class ContenedorMongoDB {
    constructor(nombreColeccion, esquema) {
        this.schema = new Schema(esquema)
        this.coleccion = mongoose.model(nombreColeccion, this.schema)
    }

    async save(elemento){
        try {
            const nuevoElemento = { ...elemento }
            const data = await this.coleccion.find()

            if(data.length === 0){
                nuevoElemento.id = 1
            }else{
                nuevoElemento.id = data[data.length-1].id + 1
            }

            nuevoElemento.timestamp = Date.now()

            await this.coleccion.create(nuevoElemento)

            return nuevoElemento.id
        } catch (error) {
            logger.error(error)
        }
    }

    /* Recibe un id y devuelve el objeto con ese id, o null si no esta */
    async getById(id) {
        try {
            const data = await this.getAll()
            if(data && data.length > 0) {
                const dataEncontrado = await this.coleccion.findOne({id: id}, { "_id": 0, "__v": 0 }) 

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

    /* Devuelve un array con los objetos presentes */
    async getAll() {   
        try {
            const data = await this.coleccion.find({}, { "_id": 0, "__v": 0 })
            
            if (!data) {
                return null
            }else{
                return data
            }
        } catch (error) {
            logger.error(error)
        }
    }

    /* Elimina el objeto con el id buscado */
    async deleteById(id) {
        try {
            const data = await this.getAll()

            if(data && data.length > 0) {
                
                const elementoEliminado = await this.getById(id)
                const result = await this.coleccion.deleteOne({id: id})

                if(result.deletedCount !== 0){
                    return elementoEliminado
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

    /* Elimina todos los objetos presentes*/
    async deleteAll() {
        try {
            const result = await this.coleccion.deleteMany({})

            if(result.deletedCount !== 0){
                return 'Collection vaciado'
            }else{
                return null
            }

        }catch(error){
            logger.error(error)
        }
    }
}

export default ContenedorMongoDB;