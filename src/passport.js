import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import pkg from 'bcrypt'

import { instanciasDaos } from './daos/index.js'

const DaoUsuarios = instanciasDaos.DaoUsuarios
const bcrypt = pkg
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

export {
    passport
}