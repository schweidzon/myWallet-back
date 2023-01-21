import dayjs from 'dayjs'
import { ObjectId } from 'mongodb'
import db from '../config/database.js'

export async function getWallet(req, res) {
    // const { authorization } = req.headers
    // const token = authorization?.replace("Bearer ", "")
    // if (!token) return res.status(422).send("Informe o token!")
    const checkSession = res.locals.session
    console.log(checkSession)
    try {
        // const checkSession = await db.collection("sessions").findOne({ token })      
        // if (!checkSession) return res.status(401).send("Você precisa estar logado para ver a carteira")
        const userWallet = await db.collection("wallet").find({ userId: ObjectId(checkSession.idUser) }).toArray()
        // db.wallet.find({ userId: ObjectId(checkSession._id) })       
        return res.send(userWallet)
    } catch (error) {
        return res.status(500).send(error.message)
    }

}

export async function addWalletItem(req, res) {
    const newValue = req.body
    const checkSession = res.locals.session 

    try {
        await db.collection("wallet").insertOne({ value: newValue.value, description: newValue.description, type: newValue.type, date: dayjs().format("DD/MM"), userId: checkSession.idUser })
        
        return res.status(201).send("Valor adicionado na carteira com sucesso")

    } catch (error) {
        return res.status(500).send(error.message)
    }

}

export async function deletetWalletItem(req, res) {
    const { id } = req.params
  
    try {    
      
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
    const checkSession = res.locals.session   

    try {
        await db.collection("wallet").updateOne({ _id: ObjectId(id) }, { $set: { value, description } })
        return res.status(204).send("Atualizado com sucesso!")

    } catch (error) {
        return res.status(500).send(error.message)

    }
    
}

