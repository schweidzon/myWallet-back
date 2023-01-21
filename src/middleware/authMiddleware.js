import db from "../config/database.js"

export async function authValidation(req, res, next) {
    
    const { authorization } = req.headers
   
    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.status(422).send("Informe o token!")
    try {
        const checkSession = await db.collection("sessions").findOne({ token })
        console.log(checkSession)

        if (!checkSession) return res.status(401).send("Você não está mais logado, por favor relogue")

        res.locals.session = checkSession

        next()
    } catch (error) {
        return res.status(500).send(error)
    }

}