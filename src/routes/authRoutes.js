import { signIn, signUp } from '../controller/auth.js'
import { Router } from 'express'
import { validateSchema } from '../middleware/validateSchema.js'
import { loginSchema, registerUserSchema } from '../schemas/authSchemas.js'

const authRouter = Router()

authRouter.post("/sign-up", validateSchema(registerUserSchema) ,signUp)
authRouter.post("/", validateSchema(loginSchema),signIn)

export default authRouter