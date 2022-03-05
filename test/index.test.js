import mongoose from 'mongoose'
import supertest from 'supertest'
import { expect } from 'chai'
import express from 'express'
import dotenv  from "dotenv"

import { routerProductos } from '../src/router/index.js'

dotenv.config()
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/productos', routerProductos)

let request
let server

describe('API Productos', () => {

    before(async function () {
        await connectDb()
        server = await startServer()
        request = supertest(`http://localhost:${server.address().port}/api/productos`)
    })

    after(function () {
        mongoose.disconnect()
        server.close()
    })
  
    describe('GET', () => {
        it('debería retornar un status 200', async () => {
            const response = await request.get('/')
            expect(response.status).to.eql(200)
        })

        it('debería retornar un status 200', async () => {
            const id = Math.ceil(Math.random() * 10)
            const response = await request.get('/' + id)
            expect(response.status).to.eql(200)
        })
    })

    describe('POST', () => {
        it('debería retornar un status 201', async () => {
            const producto = {
                    "title": "Producto Test",
                    "description": "Lorem....!!!",
                    "code": "00AA11",
                    "price": 11,
                    "thumbnail": "https://coder-conf.com/_nuxt/img/astronauta.84dff61.png",
                    "stock": 11
            }
            const response = await request.post('/').send(producto)
            expect(response.status).to.eql(201)
        })
    })

    describe('UPDATE', () => {
        it('debería retornar un status 200', async () => {
            const id = Math.ceil(Math.random() * 10)
            const producto = {
                timestamp: Date.now(),
                "title": "Producto Test Actualizado",
                "description": "Lorem....!!!",
                "code": "00AA30",
                "price": 30,
                "thumbnail": "https://coder-conf.com/_nuxt/img/astronauta.84dff61.png",
                "stock": 30
            }
            const response = await request.put('/' + id).send(producto)
            expect(response.status).to.eql(200)
        })
    })

    describe('DELETE', () => {
        it('debería retornar un status 200', async () => {
            const id = Math.ceil(Math.random() * 10)
            const response = await request.delete('/' + id)
            expect(response.status).to.eql(200)
        })
    })
})


async function connectDb() {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.fwnwb.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        console.log('Base de datos conectada!');
    } catch (error) {
        throw new Error(`Error de conexión en la base de datos: ${err}`)
    }
}

async function startServer() {
    return new Promise((resolve, reject) => {
        const PORT = 8080
        const server = app.listen(PORT, () => {
            console.log(`Servidor express escuchando en el puerto ${server.address().port}`);
            resolve(server)
        });
        server.on('error', error => {
            console.log(`Error en Servidor: ${error}`)
            reject(error)
        });
    })
}