import { addWalletItem, deletetWalletItem, getWallet, updateWalletItem } from '../controller/wallet.js'
import { Router } from 'express'

const walletRouter = Router()

walletRouter.get("/wallet", getWallet)
walletRouter.post("/update-wallet", addWalletItem)
walletRouter.delete("/update-wallet/?:id", deletetWalletItem)
walletRouter.put("/update-wallet/?:id", updateWalletItem)

export default walletRouter