import express from 'express'
import { Server as HttpServer } from 'http'
import { Server as IOServer } from 'socket.io'
import faker from 'faker'
import { normalize, denormalize, schema } from 'normalizr'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import pkg from 'bcrypt'
import yargs from 'yargs'
import cluster from 'cluster'
import os from 'os'
import compression from 'compression'

import routerProductos from './router/routerProductos.js'
import routerCarrito from './router/routerCarrito.js'
import routerRandom from './router/routerRandom.js'
import { instanciasDaos } from './daos/index.js'
import logger from './logger.js'

const DaoMensajes = instanciasDaos.DaoMensajes
const DaoUsuarios = instanciasDaos.DaoUsuarios
const DaoProductos = instanciasDaos.DaoProductos
const DaoCarritos = instanciasDaos.DaoCarritos
const bcrypt = pkg
const numCPUs = os.cpus().length

/* Passport */

passport.use(
    'register',
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
            const user = await DaoUsuarios.getByUser(username)
      
            if (user) {
                logger.info('Usuario ya existe')
                return done(null, false)
            }
      
            const newUser = {
                username: username,
                password: createHash(password),
                email: req.body.email,
                nombre: req.body.nombre,
                direccion: req.body.direccion,
                edad: req.body.edad,
                telefono: req.body.telefono,
                avatar: req.body.avatar
            }
      
            const userId = await DaoUsuarios.save(newUser)
            const userWithId = await DaoUsuarios.getById(userId)
    
            if(userWithId){
                await DaoUsuarios.newUserSendMail(newUser)
                return done(null, userWithId)
            }
        } catch (error) {
            logger.error(error)
            return done(error)
        }

      }
    )
)
  
passport.use(
    'login',
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await DaoUsuarios.getByUser(username)
          
            if (!user) {
                logger.warn('Usuario no encontrado: ' + username)
              return done(null, false)
            }
      
            if (!isValidPassword(user, password)) {
                logger.warn('Invalid Password')
              return done(null, false)
            }
      
            return done(null, user)
        } catch (error) {
            done(error)
        }
    })
)
  
passport.deserializeUser(async (id, done) => {
    const user = await DaoUsuarios.getById(id)
    done(null, user)
})

passport.serializeUser((user, done) => {
    done(null, user.id)
})
  
function isValidPassword(user, password) {
    return bcrypt.compareSync(password, user.password)
}

function createHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}

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
app.use('/uploads', express.static('src/uploads'))
app.use((req, res, next) => {
    logger.info(`Ruta: '${req.url}' Método: ${req.method}`)
    next()
})

app.use('/api/productos', routerProductos)
app.use('/api/carrito', routerCarrito)
app.use('/api/randoms', routerRandom)

function isAuth(req, res, next) {
    if(!req.user){
        res.redirect('/login')
    }else{
        next()
    }
}

app.get('/', isAuth, (req, res) => {
    if(req.user){
        res.render('index', { page: 'Inicio', auth: true, nombre: req.user.username }) 
    }else{
        res.render('index', { page: 'Inicio', auth: false })
    }
})

app.get('/productos', isAuth, async (req, res) => {
    const productos = await DaoProductos.getAll()
    res.render('products', { page: 'Productos', productos })
})

app.post('/carrito', isAuth, async (req, res) => {
    const carritoUser = await DaoCarritos.getCarritoUser(req.user.id)
    const { id, title, description, code, price, thumbnail, stock } = await DaoProductos.getById(req.body.idProducto)
    const producto = {
        id,
        timestamp: Date.now(), 
        title,
        description,
        code,
        price, 
        thumbnail,
        stock
    }
    
    if(!carritoUser){
        const idCarritoUser = await DaoCarritos.save({ productos: [], idUser: req.user.id })
        await DaoCarritos.saveProduct(idCarritoUser, producto)
    }else{
        await DaoCarritos.saveProduct(carritoUser.id, producto)
    }

    res.redirect('/productos')
})

app.get('/carrito', isAuth, async (req, res) => {
    const carritoUser = await DaoCarritos.getCarritoUser(req.user.id)
    let productos = []
    if(carritoUser){
        productos = [...carritoUser.productos]
    }

    res.render('cart', { page: 'Carrito', productos })
})

app.get('/checkout', isAuth, async (req, res) => {
    const dataUser = await DaoUsuarios.getById(req.user.id)
    const carritoUser = await DaoCarritos.getCarritoUser(req.user.id)
    await DaoCarritos.notificarCarrito(carritoUser, dataUser)
    await DaoCarritos.deleteById(carritoUser.id)
    res.render('checkout', { page: 'Checkout', username: req.user.username })
})

app.get('/perfil', isAuth, async (req, res) => {
    const dataUser = await DaoUsuarios.getById(req.user.id)
    res.render('profile', { page: 'Perfil', perfil: dataUser })
})

app.get('/register', (req, res) => {
    res.render('register', { page: 'Registro' })
})

app.post(
    '/register',
    passport.authenticate('register', { failureRedirect: '/failsignup' }), 
    (req, res) => {
        res.redirect('/login')
    }
)

app.get('/failsignup', (req, res) => {
    res.render('register-error', { page: 'Fail Register' })
})

app.get('/login', (req, res) => {
    res.render('login', { page: 'Login'})
})

app.post(
    '/login',
    passport.authenticate('login', { failureRedirect: '/faillogin' }), 
    (req, res) => {
        res.redirect('/')
    }
)

app.get('/faillogin', (req, res) => {
    res.render('login-error', { page: 'Fail Login' })
})

app.get('/logout', (req, res) => {
    if(req.user){
        const username = req.user.username
        req.session.destroy(err => {
          if (err) {
            res.json({ status: 'Logout ERROR', body: err })
          } else {
            res.render('logout', { page: 'Logout', username: username })
          }
        })
    }else{
        res.redirect('/login')
    }
})

app.get('/api/productos-test', (req, res) => {
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

app.get('/info', compression(), (req, res) => {
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

