import config from '../config.js'
import logger from '../logger.js'

let instanciasDaos
let DaoCarritos
let DaoProductos
let DaoMensajes
let DaoUsuarios


switch (config.PERS) {
    case 'mongodb':
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
    case 'firebase':
        logger.info('DB: firebase')
        const { default: CarritosDaoFirebase} = await import('./carritos/CarritosDaoFirebase.js')
        const { default: ProductosDaoFirebase} = await import('./productos/ProductosDaoFirebase.js')
        const { default: MensajesDaoFirebase} = await import('./mensajes/MensajesDaoFirebase.js')
        DaoCarritos = new CarritosDaoFirebase()
        DaoProductos = new ProductosDaoFirebase()
        DaoMensajes = new MensajesDaoFirebase()
        instanciasDaos = { DaoCarritos, DaoProductos, DaoMensajes }
        break;
    default:
        logger.info('DB: archivo')
        const { default: CarritosDaoArchivo} = await import('./carritos/CarritosDaoArchivo.js')
        const { default: ProductosDaoArchivo} = await import('./productos/ProductosDaoArchivo.js')
        const { default: MensajesDaoArchivo} = await import('./mensajes/MensajesDaoArchivo.js')
        DaoCarritos = new CarritosDaoArchivo(config.fileSystem.path)
        DaoProductos = new ProductosDaoArchivo(config.fileSystem.path)
        DaoMensajes = new MensajesDaoArchivo(config.fileSystem.path)
        instanciasDaos = { DaoCarritos, DaoProductos, DaoMensajes }
        break;
}

export { instanciasDaos } 