const express = require('express')

const router = require("./router/router")

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/', express.static('public'))
app.use('/uploads', express.static('src/uploads'))

app.use('/api/productos', router)

const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => {
    console.log(`Ya me conecte al puerto ${server.address().port} !!`)
})

server.on('error', (error) =>{
    console.log('hubo un error....')
    console.log(error)
})