import { Router } from 'express'
import { fork } from 'child_process'
const router = Router();

router.get('/', (req, res) => {
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

export default router