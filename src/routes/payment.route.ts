import { Router } from "express"
import authMiddleware from "../middlewares/auth.middleware"
import { createSubscription } from "../controllers/payment.controller"

const router: Router = Router()

router.use(authMiddleware)

router.route("/subscribe").post(createSubscription)

export default router
