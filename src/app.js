import authRouter from './routes/authRoutes.js'
import cors from 'cors'
import express from 'express'
import walletRouter from './routes/walletRoutes.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use([authRouter, walletRouter])

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server on running on port: ${PORT}`)
})
