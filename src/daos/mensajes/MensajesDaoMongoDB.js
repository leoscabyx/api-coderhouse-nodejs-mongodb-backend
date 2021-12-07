import ContenedorMongoDB from "../../contenedores/ContenedorMongoDB.js"

class MensajesDaoMongoDB extends ContenedorMongoDB {

    constructor() {
        super('mensajes', {
            id: { type: Number, required: true },
            timestamp: { type: Date, required: true },
            msj: { type: String, required: true },
            author: { type: Mixed, required: true },
            fecha: { type: String, required: true },
        })
    }
    
}

export default MensajesDaoMongoDB