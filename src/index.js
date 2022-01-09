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
const bcrypt = pkg
import yargs from 'yargs'

import routerProductos from './router/routerProductos.js'
import routerCarrito from './router/routerCarrito.js'
import { instanciasDaos } from './daos/index.js'

const DaoMensajes = instanciasDaos.DaoMensajes
const DaoUsuarios = instanciasDaos.DaoUsuarios

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
                console.log('Usuario ya existe')
                return done(null, false)
            }
      
            const newUser = {
                username: username,
                password: createHash(password)
            }
      
            const userId = await DaoUsuarios.save(newUser)
            const userWithId = await DaoUsuarios.getById(userId)
    
            if(userWithId){
                return done(null, userWithId)
            }
        } catch (error) {
            console.log(error)
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
              console.log('Usuario no encontrado: ' + username)
              return done(null, false)
            }
      
            if (!isValidPassword(user, password)) {
              console.log('Invalid Password')
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
        ttl: 100
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

app.use('/api/productos', routerProductos)
app.use('/api/carrito', routerCarrito)

app.get('/', (req, res) => {
    if(req.user){
        res.render('index', { page: 'Inicio', auth: true, nombre: req.user.username }) 
    }else{
        res.render('index', { page: 'Inicio', auth: false })
    }
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

app.get('/info', (req, res) => {
    const processDetail = {
        argumentos: process.argv.slice(2),
        plataforma: process.platform,
        versionNode: process.version,
        memoriaTotal: process.memoryUsage().rss,
        carpetaProyecto: process.cwd(),
        pathEjecucion: process.execPath
    }
    res.json(processDetail)
})

/* Manejar cualquier ruta que no este implementada en el servidor */
app.all('*', (req, res) => {
    res.json({ error : -2, descripcion: `ruta '${req.url}' método ${req.method} no implementada`})
})

io.on('connection', async (socket) => { 
    //"connection" se ejecuta la primera vez que se abre una nueva conexión
    console.log('Usuario conectado') // Se imprimirá solo la primera vez que se ha abierto la conexión
    // ContenedorMsjs.createtable()
    const msjs = await DaoMensajes.getAll()

    const user = new schema.Entity('users', {}, {idAttribute: 'email'})

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
            console.log(error)
        }
    })

    socket.emit('msjs', normalizedData) 
})

const { puerto } = yargs(process.argv.slice(2))
    .alias({
        p: 'puerto'
    })
    .default({
        puerto: 8080
    })
    .argv

const PORT = puerto
    
const server = httpServer.listen(PORT, () => {
    console.log(`Ya me conecte al puerto ${server.address().port} !!`)
})

server.on('error', (error) =>{
    console.log('hubo un error....')
    console.log(error)
})