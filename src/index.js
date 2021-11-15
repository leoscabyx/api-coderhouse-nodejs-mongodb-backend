const express = require('express')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const routerProductos = require("./router/routerProductos")
const routerCarrito = require("./router/routerCarrito")
const ContenedorKnex = require('./contenedores/contenedorKnex')
const contenedorMsjs = new ContenedorKnex({
    client: 'sqlite3',
    connection: { filename: './src/DB/mydb.sqlite' },
    useNullAsDefault: true
}, 'mensajes')

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/', express.static('public'))
app.use('/uploads', express.static('src/uploads'))

app.use('/api/productos', routerProductos)
app.use('/api/carrito', routerCarrito)

/* Manejar cualquier ruta que no este implementada en el servidor */
app.all('*', (req, res) => {
    res.json({ error : -2, descripcion: `ruta '${req.url}' método ${req.method} no implementada`})
})

io.on('connection', async (socket) => { 
    //"connection" se ejecuta la primera vez que se abre una nueva conexión
    console.log('Usuario conectado') // Se imprimirá solo la primera vez que se ha abierto la conexión
    contenedorMsjs.createtable()

    socket.on('msj', async (mensajeNuevo) => {
        try {
            // console.log(mensajeNuevo)
            await contenedorMsjs.save(mensajeNuevo)
            const msjs = await contenedorMsjs.getAll()

            io.sockets.emit('msjs', msjs)
        } catch (error) {
            console.log(error)
        }
    })

    const getMsjs = await contenedorMsjs.getAll()
    // console.log(getMsjs)
    socket.emit('msjs', getMsjs)
})

const PORT = process.env.PORT || 8080

const server = httpServer.listen(PORT, () => {
    console.log(`Ya me conecte al puerto ${server.address().port} !!`)
})

server.on('error', (error) =>{
    console.log('hubo un error....')
    console.log(error)
})