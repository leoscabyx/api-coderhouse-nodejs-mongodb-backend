import ContenedorMongoDB from "../../contenedores/ContenedorMongoDB.js"
// import sendMail from '../../nodemailer/index.js'
// import config from '../../config.js'

class UsuariosDaoMongoDB extends ContenedorMongoDB {

    constructor() {
        super('usuarios', {
            id: { type: Number, required: true },
            timestamp: { type: Date, required: true },
            email: { type: String, required: true },
            password: { type: String, required: true },
            nombre: { type: String, required: true },
            telefono: { type: String, required: true },
            avatar: { type: String, required: true },
            role: { type: String, enum : ['user','admin'], default: "user"}
        })
    }

    async getByUser(email) {
        try {

            const usuarioEncontrado = await this.coleccion.findOne({ email: email })
            
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

    /* async newUserSendMail(data){
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
    } */
}

export default UsuariosDaoMongoDB