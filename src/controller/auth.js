import bcrypt from 'bcrypt'
import { v4 as uuidV4 } from 'uuid'
import { loginSchema, registerUserSchema } from '../schemas/authSchemas.js'
import db from '../config/database.js'


export async function signUp(req, res) {
    const user = req.body

    try {
        const encryptPassword = bcrypt.hashSync(user.password, 10)

        const checkUserExist = await db.collection("users").findOne({ name: user.name })
        console.log(checkUserExist)
        if (checkUserExist) return res.status(409).send("Usuário já cadastrado!")
        await db.collection("users").insertOne({ name: user.name, email: user.email, password: encryptPassword })
        res.status(201).send("Usuário cadastrado com sucesso")

    } catch (error) {
        console.log(error.message)
        return res.status(500).send(error.message)
    }

}

export async function signIn(req, res) {

    const user = req.body

    // const validateUser = loginSchema.validate(user, { abortEarly: false })

    // if (validateUser.error) {
    //     const erros = validaValue.error.details.map((err) => {
    //         return err.message
    //     })
    //     return res.status(422).send(erros)
    // }

    try {
        const userExist = await db.collection("users").findOne({ email: user.email })
        console.log(userExist)

        if (!userExist) return res.status(400).send("Usuário ou senha incorretos")

        const matchPassword = bcrypt.compareSync(user.password, userExist.password)

        if (!matchPassword) return res.status(400).send("Usuário ou senha incorretos")

        const token = uuidV4()

        await db.collection("sessions").insertOne({ idUser: userExist._id, token, user: userExist.name })
        const resp = await db.collection("sessions").findOne({ token })
        return res.send(resp)

    } catch (error) {
        console.log(error.message)
        return res.status(500).send(error.message)
    }

}
