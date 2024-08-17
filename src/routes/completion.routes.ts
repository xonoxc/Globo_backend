import { Router } from "express"
import authMiddleware from "../middlewares/auth.middleware"
import { getCompletion } from "../controllers/ai.controller"

const router: Router = Router()

router.use(authMiddleware)

router.route("/summerize").post(getCompletion)

export default router
