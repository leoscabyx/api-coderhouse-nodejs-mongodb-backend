import dotenv  from "dotenv"

dotenv.config()

let dbstr = ''
const NODE_ENV = process.env.NODE_ENV || 'dev'
console.log(NODE_ENV)
if (NODE_ENV === 'prod'){
    dbstr = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.fwnwb.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
}else{
    dbstr = `mongodb://localhost/${process.env.MONGO_DATABASE}`
}
console.log(dbstr)

export default {
    PERS: process.env.DB_PERSISTENCIA,
    mongodb: {
        cnxStr: dbstr
    },
    MAIL_ADMIN: process.env.MAIL_ADMIN || 'leoscabyx@gmail.com'
}