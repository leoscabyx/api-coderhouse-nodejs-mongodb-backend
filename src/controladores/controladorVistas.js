import os from 'os'
const numCPUs = os.cpus().length

async function getViewInfo (req, res) {
    const processDetail = {
        argumentos: process.argv.slice(2).length > 0 ? process.argv.slice(2).join(',') : 'Sin argumentos por terminal',
        plataforma: process.platform,
        versionNode: process.version,
        memoriaTotal: process.memoryUsage().rss,
        carpetaProyecto: process.cwd(),
        pathEjecucion: process.execPath,
        cpus: numCPUs,
        pid: process.pid
    }
    res.render('info', { page: 'Detalle Servidor en Node', data: processDetail })
}

async function getViewChat (req, res) {
    res.render('chat', { page: 'WebSockets en Node' })
}

export {
    getViewInfo,
    getViewChat,
}