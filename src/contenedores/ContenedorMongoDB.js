import mongoose from 'mongoose'

import config from '../config.js'
import sendMail from '../nodemailer/index.js'

const { Schema } = mongoose;

// await mongoose.connect('mongodb+srv://leoscabyx:coderhouse@cluster0.fwnwb.mongodb.net/ecommerce?retryWrites=true&w=majority');
await mongoose.connect(config.mongodb.cnxStr);
    
// console.log('Base MongoDB conectada')

class ContenedorMongoDB {
    constructor(nombreColeccion, esquema) {
        this.schema = new Schema(esquema)
        this.coleccion = mongoose.model(nombreColeccion, this.schema)
    }

    async save(nuevoElemento){
        try {
            const data = await this.coleccion.find()

            if(data.length === 0){
                nuevoElemento.id = 1
            }else{
                nuevoElemento.id = data[data.length-1].id + 1
            }

            nuevoElemento.timestamp = Date.now()

            await this.coleccion.create(nuevoElemento)

            await sendMail({
                to: config.MAIL_ADMIN,
                subject: 'Nuevo Registro Usuario (APP)',
                html: `Datos:
                        Nombre: ${nuevoElemento.nombre}
                        Direccion: ${nuevoElemento.direccion}
                        Edad: ${nuevoElemento.edad}
                        Telefono: ${nuevoElemento.telefono}
                        Avatar: ${nuevoElemento.avatar}
                        `
            })

            return nuevoElemento.id
        } catch (error) {
            console.log(error)
        }
    }

    /* Recibe un id y devuelve el objeto con ese id, o null si no esta */
    async getById(id) {
        try {
            const data = await this.getAll()
            if(data && data.length > 0) {
                const dataEncontrado = await this.coleccion.findOne({id: id})
                // console.log(dataEncontrado)
                if (dataEncontrado) {
                    return dataEncontrado
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

    /* Devuelve un array con los objetos presentes */
    async getAll() {   
        try {
            const data = await this.coleccion.find()
            
            if (!data) {
                return null
            }else{
                return data
            }
        } catch (error) {
            console.log(error)
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
            console.log(error)
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
            console.log(error)
        }
    }
}

export default ContenedorMongoDB;