import config from '../config.js'

// import CarritosDaoArchivo from './carritos/CarritosDaoArchivo.js'
// import CarritosDaoMongoDB from './carritos/CarritosDaoMongoDB.js'
// import CarritosDaoFirebase from './carritos/CarritosDaoFirebase.js'

// import ProductosDaoArchivo from './productos/ProductosDaoArchivo.js'
// import ProductosDaoMongoDB from './productos/ProductosDaoMongoDB.js'
// import ProductosDaoFirebase from './productos/ProductosDaoFirebase.js'

let instanciasDaos
let DaoCarritos
let DaoProductos


switch (config.PERS) {
    case 'mongodb':
        console.log('mongodb')
        const { default: CarritosDaoMongoDB} = await import('./carritos/CarritosDaoMongoDB.js')
        const { default: ProductosDaoMongoDB} = await import('./productos/ProductosDaoMongoDB.js')
        DaoCarritos = new CarritosDaoMongoDB()
        DaoProductos = new ProductosDaoMongoDB()
        instanciasDaos = { DaoCarritos, DaoProductos }
        break;
    case 'firebase':
        console.log('firebase')
        const { default: CarritosDaoFirebase} = await import('./carritos/CarritosDaoFirebase.js')
        const { default: ProductosDaoFirebase} = await import('./productos/ProductosDaoFirebase.js')
        DaoCarritos = new CarritosDaoFirebase()
        DaoProductos = new ProductosDaoFirebase()
        instanciasDaos = { DaoCarritos, DaoProductos }
        break;
    default:
        console.log('archivo')
        const { default: CarritosDaoArchivo} = await import('./carritos/CarritosDaoArchivo.js')
        const { default: ProductosDaoArchivo} = await import('./productos/ProductosDaoArchivo.js')
        DaoCarritos = new CarritosDaoArchivo(config.fileSystem.path)
        DaoProductos = new ProductosDaoArchivo(config.fileSystem.path)
        instanciasDaos = { DaoCarritos, DaoProductos }
        break;
}

export { instanciasDaos } 