import config from '../config.js'
import logger from '../logger.js'

let instanciasDaos
let DaoCarritos
let DaoProductos
let DaoMensajes
let DaoUsuarios


switch (config.PERS) {
    default:
        logger.info('DB: mongodb')
        const { default: CarritosDaoMongoDB} = await import('./carritos/CarritosDaoMongoDB.js')
        const { default: ProductosDaoMongoDB} = await import('./productos/ProductosDaoMongoDB.js')
        const { default: MensajesDaoMongoDB} = await import('./mensajes/MensajesDaoMongoDB.js')
        const { default: UsuariosDaoMongoDB} = await import('./usuarios/UsuariosDaoMongoDB.js')
        DaoCarritos = new CarritosDaoMongoDB()
        DaoProductos = new ProductosDaoMongoDB()
        DaoMensajes = new MensajesDaoMongoDB()
        DaoUsuarios = new UsuariosDaoMongoDB()
        instanciasDaos = { DaoCarritos, DaoProductos, DaoMensajes, DaoUsuarios }
        break;
}

// Exportar la instancia de nuestros DAO's con unica instancia, pero multiples DAO's
export { instanciasDaos } 