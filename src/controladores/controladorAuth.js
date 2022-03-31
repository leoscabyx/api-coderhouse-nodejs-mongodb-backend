import pkg from 'bcrypt'

import { instanciasDaos } from '../daos/index.js'
import { tokenSign } from '../jwt/index.js'
import logger from '../logger.js'

const bcrypt = pkg
const DaoUsuarios = instanciasDaos.DaoUsuarios

async function postLoginController(req, res) {
    try {
        const body = req.body
        const user = await DaoUsuarios.getByUser(body.email);
        if (!user) {
          res.status(404).json({ error: "Usuario NO Existe"})
          return;
        }
        const checkPassword = bcrypt.compareSync(body.password, user.password)
    
        if (!checkPassword) {
            res.status(402).json({ error: "Password Invalida"})
          return;
        }
    
        const tokenJwt = await tokenSign(user);
    
        const data = {
          token: tokenJwt,
          user: user,
        };
    
        res.json({ data });
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

async function postRegisterController(req, res, next) {
    try {
        
        const file = req.file
        let avatar = null

        if(file){
            const { filename } = req.file
            avatar = `${req.protocol}://${req.get('host')}/uploads/${filename}`
        }else if (req.body.avatar) {
            avatar = req.body.avatar
        }else{
            const error = new Error('Please upload a file')
            error.httpStatusCode = 400
            return next(error)
        }

        const body = req.body
        const checkIsExist = await DaoUsuarios.getByUser(body.email);

        if (checkIsExist) {
          res.status(401).json({ error: "Usuario ya Existe"})
          return;
        }
        
        const password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(10), null)
        const bodyInsert = { ...body, password, avatar };

        const idUser = await DaoUsuarios.save(bodyInsert)
        
        if(!idUser) {
            res.status(401).json({ error: "No se pudo crear el usuario" })
        }else{
            const data = {
                id: idUser,
                data: bodyInsert
            }
            res.status(200).json({ data })
        }
        
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error })
    }
}

async function getUsers(req, res) {
    const data = await DaoUsuarios.getAll();   
    res.json({ data })
}

export {
    postLoginController,
    postRegisterController,
    getUsers
}
