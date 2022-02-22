import { Router } from 'express'
import { fork } from 'child_process'
import faker from 'faker'
import compression from 'compression'

const router = Router();

router.get('/api/randoms', (req, res) => {
    const cant = req.query.cant ?? 500_000_000

    if (isNaN(cant)) {
        return res.json({ error: 'La cantidad debe ser un numero' })
    }

    const forked = fork('./src/child.js')
    forked.on('message', (msg) => {
        if (msg == 'listo') {
            forked.send(cant)
        } else {
            res.json(msg)
        }
    })
})

router.get('/api/productos-test', (req, res) => {
    const productos = []
    for (let i = 0; i < 5; i++) {
        const nuevoProducto = {
            nombre: `${faker.name.firstName()}  ${faker.name.lastName()}`,
            precio: parseInt(faker.commerce.price()),
            foto: faker.image.avatar()
        }
        productos.push(nuevoProducto)
    }

    res.json({msj: 'Productos Test Mock con Faker.js', productos})
})

router.get('/info', compression(), (req, res) => {
    const processDetail = {
        argumentos: process.argv.slice(2),
        plataforma: process.platform,
        versionNode: process.version,
        memoriaTotal: process.memoryUsage().rss,
        carpetaProyecto: process.cwd(),
        pathEjecucion: process.execPath,
        cpus: numCPUs,
        pid: process.pid
    }
    res.json(processDetail)
})

export default router