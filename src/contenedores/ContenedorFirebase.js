import fs from 'fs'
import admin from "firebase-admin"

import config from '../config.js'

const serviceAccount = JSON.parse(fs.readFileSync(config.firebase.jsonDirCredential, 'utf8'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

logger.info('Base Firebase conectada!')

const db = admin.firestore();

class ContenedorFirebase {
    constructor(nombreCollection){
        this.collection = db.collection(nombreCollection)
    }

    async save(nuevoElemento) {

        try {
            const snapshot = await this.collection.get();
    
            if(snapshot.size === 0){
                nuevoElemento.id = 1
                const doc = this.collection.doc(`${nuevoElemento.id}`)
                await doc.create({...nuevoElemento, timestamp: Date.now()})
    
                return nuevoElemento.id
    
            }else{
                const querySnapshot = await this.collection.get()
    
                const docs = querySnapshot.docs;
    
                const ids = docs.map( doc => ({ id: doc.data().id }))
    
                nuevoElemento.id = ids[ids.length - 1].id + 1
                const doc = this.collection.doc(`${nuevoElemento.id}`)
                await doc.create({...nuevoElemento, timestamp: Date.now()})
    
                return nuevoElemento.id
    
            }
        } catch (error) {
            logger.error(error)
        }
    }

    async getAll() {

        try {
            const querySnapshot = await this.collection.get()
            const docs = querySnapshot.docs
    
            const elementos = docs.map( (doc) => ({...doc.data()}))
    
            if(Array.isArray(elementos)){
                return elementos
            }else{
                // Revisar que se va a retornar ya que "docs" devolveria un array vacio [] mas alla de que no exista la collection o conviene devolver null
                return null
            }
        } catch (error) {
            logger.error(error)
        }

    }

    async getById(id) {

        try {
            const doc = this.collection.doc(`${id}`)
            const respuesta = await doc.get()
            const elemento = respuesta.data()
            if(elemento){
                return elemento
            }else{
                return null
            }
        } catch (error) {
            logger.error(error)
        }
        
    }

    async deleteById(id) {
        try {
            const existDoc = await this.getById(id)
            if(existDoc){
                const doc = this.collection.doc(`${id}`)

                const respuesta = await doc.delete()

                return existDoc
            }else{
                return null
            }
        } catch (error) {
            logger.error(error)
        }
    }

}

export default ContenedorFirebase;