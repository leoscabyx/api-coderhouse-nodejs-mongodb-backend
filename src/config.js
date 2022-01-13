import dotenv  from "dotenv"

dotenv.config()

const PERS = process.env.DB_PERSISTENCIA || 'mongodb'

export default {
    PERS,
    fileSystem: {
        path: './src/DB/'
    },
    mongodb: {
        cnxStr: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.fwnwb.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
    },
    firebase: {
        jsonDirCredential: './src/coderhouse-firestore-17035-firebase-adminsdk-7bvnl-c04028e58c.json'
    }
}