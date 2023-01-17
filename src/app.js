import express from 'express'
import cors from 'cors'
import joi from 'joi'
import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import {registerUserSchema} from '../validators.js'
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

app.post("/cadastro", (req, res) => {
    const user = req.body
    const validateUser= registerUserSchema.validate(user, {abortEarly:false})
   

    if (validateUser.error) {
        const erros = validateUser.error.details.map((err) => {
            if(err.message ==='"confirmPassword" must be [ref:password]' ) {
                err.message = "confirmPassword tem que ser igual ao password"
            }
            
            return err.message
        })
        return res.status(422).send(erros)
    }
    db.collection("user").insertOne({user})
    res.status(201).send("Usuário criado com sucesso")
  
}) 

const PORT = 5000

app.listen(PORT, () => {
    console.log("Server onn running on port: 5000")
})
