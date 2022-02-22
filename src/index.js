import express from 'express'
import { Server as HttpServer } from 'http'
import { Server as IOServer } from 'socket.io'

import { normalize, denormalize, schema } from 'normalizr'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import yargs from 'yargs'
import cluster from 'cluster'
import os from 'os'

import routerProductos from './router/routerProductos.js'
import routerCarritos from './router/routerCarritos.js'
import routerVistas from './router/routerVistas.js'
import routerAuth from './router/routerAuth.js'
import routerTest from './router/routerTest.js'
import { instanciasDaos } from './daos/index.js'
import logger from './logger.js'
import { passport } from './passport.js'

const DaoMensajes = instanciasDaos.DaoMensajes
const numCPUs = os.cpus().length

/* Express */

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(session({
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://leoscabyx:coderhouse@cluster0.fwnwb.mongodb.net/ecommerce?retryWrites=true&w=majority',
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 24 * 60 * 60
    }),
    secret: 'secreto',
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //     maxAge: 10000
    // }
}))
app.use(passport.initialize());
app.use(passport.session());

app.use('/', express.static('public'))
app.use('/uploads', express.static('public/uploads'))
app.use((req, res, next) => {
    logger.info(`Ruta: '${req.url}' Método: ${req.method}`)
    next()
})

app.use('/api/productos', routerProductos)
app.use('/api/carrito', routerCarritos)
app.use('/', routerVistas)
app.use('/', routerAuth)
app.use('/', routerTest)

/* Manejar cualquier ruta que no este implementada en el servidor */
app.all('*', (req, res) => {
    logger.warn(`ruta '${req.url}' método ${req.method} no implementada`)
    res.json({ error : -2, descripcion: `ruta '${req.url}' método ${req.method} no implementada`})
})

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

const { puerto, modo } = yargs(process.argv.slice(2))
    .alias({
        p: 'puerto',
        m: 'modo'
    })
    .default({
        puerto: process.env.PORT || 8080,
        modo: 'fork'
    })
    .argv

if(modo === 'cluster'){
    
    if (cluster.isPrimary) {
        logger.info(`Modo: ${modo}`)
        logger.info(`Numero CPU's: ${numCPUs}`)
        logger.info(`PID MASTER ${process.pid}`)

        for (let i = 0; i < numCPUs; i++) {
            cluster.fork()
        }
    
        cluster.on('exit', worker => {
            logger.info('Worker', worker.process.pid, 'died', new Date().toLocaleString())
            cluster.fork()
        })
    }else{
        const PORT = puerto
    
        const server = httpServer.listen(PORT, () => {
            logger.info(`Servidor: Conectado al puerto ${server.address().port} !!`)
        })

        server.on('error', (error) =>{
            logger.error(error)
        })
    }
}else{
    logger.info(`Modo: ${modo}`)
    logger.info(`Numero CPU's: ${numCPUs}`)

    const PORT = puerto
    
    const server = httpServer.listen(PORT, () => {
        logger.info(`Servidor: Conectado al puerto ${server.address().port} !!`)
    })

    server.on('error', (error) =>{
        logger.error(error)
    })
}

