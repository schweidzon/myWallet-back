import dayjs from 'dayjs'
import { editSchema, entriesSchema } from '../models/walletSchemas.js'
import { ObjectId } from 'mongodb'
import db from '../config/database.js'

export async function getWallet(req, res) {
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
        return res.status(500).send(error.message)
    }

}

export async function addWalletItem(req, res) {
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
        return res.status(500).send(error.message)
    }

}

export async function deletetWalletItem(req, res) {
    const { id } = req.params
    const { authorization } = req.headers
    if (!authorization) return res.status(404).send("Você não tem autorização para deletar uma mensagem")
    const token = authorization.replace("Bearer ", "")
    if (!token) return res.status(422).send("Informe o token!")
    try {
        const checkUser = await db.collection("sessions").findOne({ token })
        if (!checkUser) return res.status(401).send("Você não tem autorização para deletar uma mensagem")
        console.log(id)
        await db.collection("wallet").deleteOne({ _id: ObjectId(id) })
        return res.sendStatus(202)

    } catch (error) {
        console.log(error)
        return res.status(500).send(error.message)
    }
}

export async function updateWalletItem(req, res) {
    const { id } = req.params
    const { value, description } = req.body
    const valueToUpdate = await db.collection("wallet").findOne({ _id: ObjectId(id) })
    if (!value) return res.send({value: Number(valueToUpdate.value).toFixed(2), description: valueToUpdate.description })
    const { authorization } = req.headers

    const validaValue = editSchema.validate({ ...req.body }, { abortEarly: false })

    if (validaValue.error) {
        const erros = validaValue.error.details.map((err) => {
            return err.message
        })
        return res.status(422).send(erros)
    }

    if (!authorization) return res.status(404).send("Você não tem autorização para editar uma mensagem")
    const token = authorization.replace("Bearer ", "")
    if (!token) return res.status(422).send("Informe o token!")

    try {
        const checkUser = await db.collection("sessions").findOne({ token })
        if (!checkUser) return res.status(401).send("Você não tem autorização para editar uma mensagem")


        await db.collection("wallet").updateOne({ _id: ObjectId(id) }, { $set: { value, description } })
        return res.status(204).send("Atualizado com sucesso!")

    } catch (error) {
        return res.status(500).send(error.message)

    }
    
}

