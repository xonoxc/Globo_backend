import { Router } from "express"
import { healthCheck } from "../controllers/healthCheck/route"

const router: Router = Router()

router.route("/health/c").get(healthCheck)

export default router
