import { normalize, denormalize, schema } from 'normalizr'
import logger from '../logger.js'

import { instanciasDaos } from '../daos/index.js'
const DaoMensajes = instanciasDaos.DaoMensajes

function setConnection(io) {
    io.on('connection', async (socket) => { 
        //"connection" se ejecuta la primera vez que se abre una nueva conexión
        logger.info('Websocket: Usuario conectado') // Se imprimirá solo la primera vez que se ha abierto la conexión
        // ContenedorMsjs.createtable()
        const msjs = await DaoMensajes.getAll()
    
        const user = new schema.Entity('users', {}, { idAttribute: 'email' })
    
        const mensaje = new schema.Entity('mensajes', {
            author: user
        });
    
        const chats = new schema.Entity('chats', {
            mensajes: [mensaje]
        });
    
        const originalData = {
            id: "999",
            mensajes: msjs
        }
    
        const normalizedData = normalize(originalData, chats)
    
        socket.on('msj', async (mensajeNuevo) => {
            try {
                await DaoMensajes.save(mensajeNuevo)
                const msjs = await DaoMensajes.getAll()
                const normalizedData = normalize({
                    id: "999",
                    mensajes: msjs
                }, chats)
    
                io.sockets.emit('msjs', normalizedData)
            } catch (error) {
                logger.error(error)
            }
        })
    
        socket.emit('msjs', normalizedData) 
    })
}

export { setConnection }