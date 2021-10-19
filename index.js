const express = require('express')

const router = require("./router.js")


const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/static', express.static('public'))

app.use('/api/productos', router)

app.get('/', (req, respuesta) => {
    respuesta.send('HolaMundo')
    console.log('prueba')
})

const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => {
    console.log(`Ya me conecte al puerto ${server.address().port} !!`)
})

server.on('error', (error) =>{
    console.log('hubo un error....')
    console.log(error)
})