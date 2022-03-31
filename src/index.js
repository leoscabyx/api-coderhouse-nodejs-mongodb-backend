import express from 'express'
import { Server as HttpServer } from 'http'
import { Server as IOServer } from 'socket.io'

import yargs from 'yargs'
import cluster from 'cluster'
import os from 'os'

import { routerProductos, routerCarritos, routerVistas, routerAuth } from './router/index.js'
import logger from './logger.js'
import { setConnection } from './websocket/socket.js'

const numCPUs = os.cpus().length

/* Express */

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/', express.static('public'))

app.use((req, res, next) => {
    logger.info(`Ruta: '${req.url}' Método: ${req.method}`)
    next()
})

app.use('/api/auth', routerAuth)
app.use('/api/productos', routerProductos)
app.use('/api/carrito', routerCarritos)
app.use('/', routerVistas)

/* Manejar cualquier ruta que no este implementada en el servidor */
app.all('*', (req, res) => {
    logger.warn(`ruta '${req.url}' método ${req.method} no implementada`)
    res.json({ error : -2, descripcion: `ruta '${req.url}' método ${req.method} no implementada`})
})

/* WebSocket */
setConnection(io)

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
    logger.info(`Env: ${process.env.NODE_ENV || 'dev'}`)
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

