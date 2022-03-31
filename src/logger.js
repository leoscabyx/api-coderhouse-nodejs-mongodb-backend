import log4js from 'log4js'

log4js.configure({
    appenders: {
        consola: { type: "console" },
        archivoWarn: { type: "file", filename: "warn.log"},
        archivoError: { type: "file", filename: "error.log"},
        loggerConsola: {
            type: 'logLevelFilter',
            appender: 'consola',
            level: 'info',
        },
        loggerArchivoWarn: {
            type: 'logLevelFilter',
            appender: 'archivoWarn',
            level: 'warn'
        },
        loggerArchivoError: {
            type: 'logLevelFilter',
            appender: 'archivoError',
            level: 'error'
        }
    },
    categories: {
        default: { 
            appenders: ["loggerConsola", "loggerArchivoWarn"], 
            level: "all"
        },
        prod: {
            appenders: ['loggerArchivoError'],
            level: 'all'
        },
    }
})

let logger = null

if (process.env.NODE_ENV === 'prod') {
    logger = log4js.getLogger('prod')
  } else {
    logger = log4js.getLogger()
  }
  
  export default logger