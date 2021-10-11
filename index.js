const express = require('express')
const Contenedor = require('./manejo-archivos-promesas')

const contenedorProductos = new Contenedor('./productos.txt')

const app = express()

app.get('/', (peticion, respuesta) => {
    respuesta.send('HolaMundo')
    console.log('prueba')
})

app.get('/productos', async (peticion, respuesta) => {
    /* console.log(await contenedorProductos.getAll()) */
    respuesta.send( await contenedorProductos.getAll())
    console.log('Devolver todos los productos')
})

app.get('/productoRandom', async (peticion, respuesta) => {
    /* console.log(await contenedorProductos.getById( parseInt((Math.random() * 3) + 1) )) */
    respuesta.send(await contenedorProductos.getById( parseInt((Math.random() * 4) + 1) ))
    console.log('Devolver producto aletorio')
})

const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => {
    console.log(`Ya me conecte al puerto ${server.address().port} !!`)
})

server.on('error', (error) =>{
    console.log('hubo un error....')
    console.log(error)
})