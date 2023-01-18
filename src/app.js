import express from 'express'
import cors from 'cors'
import joi from 'joi'
import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import { registerUserSchema } from '../validators.js'
import dayjs from 'dayjs'
import bcrypt from 'bcrypt'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db

try {

    await mongoClient.connect()
    db = mongoClient.db()

} catch (erro) {
    console.log(erro)

}

app.post("/cadastro", async (req, res) => {
    const user = req.body
    console.log(user)
    const validateUser = registerUserSchema.validate(user, { abortEarly: false })

    const encryptPassword = bcrypt.hashSync(user.password, 10)

    const checkUserExist = await db.collection("users").findOne({ name: user.name })
    console.log(checkUserExist)
    if (checkUserExist) return res.status(409).send("Usuário já cadastrado!")


    if (validateUser.error) {
        const erros = validateUser.error.details.map((err) => {
            if (err.message === '"confirmPassword" must be [ref:password]') {
                err.message = "confirmPassword tem que ser igual ao password"
            }
            if (err.message.includes("/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]+$/")) {
                err.message = "Nome de usuário inválido"
            }

            return err.message
        })
        return res.status(422).send(erros)
    }
    await db.collection("users").insertOne({...req.body, password:encryptPassword,wallet: []})
    res.status(201).send("Usuário cadastrado com sucesso")

})

app.post("/", async (req, res) => {
    const user = req.body
    console.log(user.email)
    console.log(user.password)
    //console.log( await db.collection("users").find().toArray())
    const userExist = await db.collection("users").findOne({ email: user.email })

    if (!userExist) return res.status(400).send("Usuário ou senha incorretos")

    const matchPassword = bcrypt.compareSync(user.password, userExist.password )

    if(!matchPassword) return res.status(400).send("Usuário ou senha incorretos")

    return res.send(userExist)
})

app.get("/values", async(req, res) => {   
    const user = req.headers.user  
    const userExist = await db.collection("users").findOne({name:user})   
    return res.send(userExist)
})

app.post("/update-wallet", async (req, res) => {
    const newValue = req.body
    await db.collection("users").updateOne({name: newValue.user}, {$push: { wallet: {value: newValue.value, description: newValue.description, type: newValue.type, date: dayjs().format("DD/MM") }}})
    //console.log( await db.collection("users").findOne({name: newValue.user}) )
    return res.send("ok")
})



const PORT = 5000

app.listen(PORT, () => {
    console.log("Server onn running on port: 5000")
})
