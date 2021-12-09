import ContenedorArchivo from "../../contenedores/ContenedorArchivo.js"

class MensajesDaoArchivo extends ContenedorArchivo {

    constructor(rutaDir) {
        super(`${rutaDir}mensajes-db.txt`)
    }

}

export default MensajesDaoArchivo