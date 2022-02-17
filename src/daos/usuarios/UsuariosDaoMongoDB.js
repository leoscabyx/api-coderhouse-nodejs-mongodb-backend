import ContenedorMongoDB from "../../contenedores/ContenedorMongoDB.js"
import sendMail from '../../nodemailer/index.js'
import config from '../../config.js'

class UsuariosDaoMongoDB extends ContenedorMongoDB {

    constructor() {
        super('usuarios', {
            id: { type: Number, required: true },
            timestamp: { type: Date, required: true },
            username: { type: String, required: true },
            password: { type: String, required: true },
            email: { type: String, required: true },
            nombre: { type: String, required: true },
            direccion: { type: String, required: true },
            edad: { type: Number, required: true },
            telefono: { type: String, required: true },
            avatar: { type: String, required: true },
        })
    }

    async getByUser(username) {
        try {

            const usuarioEncontrado = await this.coleccion.findOne({ username: username })
            
            if(usuarioEncontrado){
                return usuarioEncontrado
            }else{
                return null
            }

        } catch (error) {
            logger.error(error)
        }
    }

    /* Enviar mail cuando un usuario se registra */

    async newUserSendMail(data){
        await sendMail({
            to: config.MAIL_ADMIN,
            subject: 'Nuevo Registro Usuario (APP)',
            html: `Datos:
                    Nombre: ${data.nombre}
                    Direccion: ${data.direccion}
                    Edad: ${data.edad}
                    Telefono: ${data.telefono}
                    Avatar: ${data.avatar}
                    `
        })
    }
}

export default UsuariosDaoMongoDB