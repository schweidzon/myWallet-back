import express from 'express'
import cors from 'cors'
import joi from 'joi'
import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import { entriesSchema, loginSchema, registerUserSchema } from '../validators.js'
import dayjs from 'dayjs'
import bcrypt from 'bcrypt'
import { v4 as uuidV4 } from 'uuid'
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

    const encryptPassword = bcrypt.hashSync(user.password, 10)

    const checkUserExist = await db.collection("users").findOne({ name: user.name })
    console.log(checkUserExist)
    if (checkUserExist) return res.status(409).send("Usuário já cadastrado!")

    const validateUser = registerUserSchema.validate(user, { abortEarly: false })

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
    await db.collection("users").insertOne({ ...req.body, password: encryptPassword })
    res.status(201).send("Usuário cadastrado com sucesso")

})

app.post("/", async (req, res) => {
    const user = req.body

    const validateUser = loginSchema.validate(user, {abortEarly:false})

    if(validateUser.error) {
        const erros = validaValue.error.details.map((err) => {
            return err.message
        })
        return res.status(422).send(erros)
    }

    try {
        const userExist = await db.collection("users").findOne({ email: user.email })
        console.log(userExist)

        if (!userExist) return res.status(400).send("Usuário ou senha incorretos")
    
        const matchPassword = bcrypt.compareSync(user.password, userExist.password)
    
        if (!matchPassword) return res.status(400).send("Usuário ou senha incorretos")
    
        const token = uuidV4()
    
        await db.collection("sessions").insertOne({ idUser: userExist._id, token, user: userExist.name })
        const resp = await db.collection("sessions").findOne({token})
        return res.send(resp)
        
    } catch (error) {
        console.log(error.message)
        return res.sendStatus(500)
    }

   
})

app.get("/values", async (req, res) => {

    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.status(422).send("Informe o token!")
    try {
        const checkSession = await db.collection("sessions").findOne({ token })
        console.log(checkSession)
        if (!checkSession) return res.status(401).send("Você precisa estar logado para ver a carteira")
        const userWallet = await db.collection("wallet").find({ userId: ObjectId(checkSession.idUser) }).toArray()
        // db.wallet.find({ userId: ObjectId(checkSession._id) })       
        return res.send(userWallet)
    } catch (error) {
        return res.sendStatus(500)
    }

})

app.post("/update-wallet", async (req, res) => {
    const newValue = req.body
    const { authorization } = req.headers
    const validaValue = entriesSchema.validate(newValue, { abortEarly: false })

    if (validaValue.error) {
        const erros = validaValue.error.details.map((err) => {
            return err.message
        })
        return res.status(422).send(erros)
    }

    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.status(422).send("Informe o token!")

    try {
        const checkSession = await db.collection("sessions").findOne({ token })
        if (!checkSession) return res.status(401).send("Você não tem autorização para cadastrar um novo valor na carteira")
        console.log(checkSession)
        console.log(checkSession.idUser)
        await db.collection("wallet").insertOne({ value: newValue.value, description: newValue.description, type: newValue.type, date: dayjs().format("DD/MM"), userId: checkSession.idUser })
        // await db.collection("users").updateOne({ name: newValue.user }, { $push: { wallet: { value: newValue.value, description: newValue.description, type: newValue.type, date: dayjs().format("DD/MM"), id: checkSession._id } } })
        //console.log( await db.collection("users").findOne({name: newValue.user}) )
        return res.send("ok")

    } catch (error) {
        return res.sendStatus(500)
    }

})



const PORT = 5000

app.listen(PORT, () => {
    console.log("Server onn running on port: 5000")
})
