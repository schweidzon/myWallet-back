import { addWalletItem, deletetWalletItem, getWallet, updateWalletItem } from '../controller/wallet.js'
import { Router } from 'express'
import {validateSchema} from '../middleware/validateSchema.js'
import { editSchema, entriesSchema } from '../schemas/walletSchemas.js'
import { authValidation } from '../middleware/authMiddleware.js'

const walletRouter = Router()

walletRouter.get("/wallet", authValidation ,getWallet)
walletRouter.post("/update-wallet", authValidation,validateSchema(entriesSchema), addWalletItem)
walletRouter.delete("/update-wallet/?:id",authValidation, deletetWalletItem)
walletRouter.put("/update-wallet/?:id", authValidation,validateSchema(editSchema),updateWalletItem)

export default walletRouter