import ContenedorMongoDB from "../../contenedores/ContenedorMongoDB.js"

class UsuariosDaoMongoDB extends ContenedorMongoDB {

    constructor() {
        super('usuarios', {
            id: { type: Number, required: true },
            timestamp: { type: Date, required: true },
            username: { type: String, required: true },
            password: { type: String, required: true },
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
            console.log(error)
        }
    }
}

export default UsuariosDaoMongoDB