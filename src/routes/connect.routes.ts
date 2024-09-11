import { Router } from "express"

import {
     getUserFollowers,
     getUserFollowing,
     toggleConnection,
} from "../controllers/connect.controller"
import authMiddleware from "../middlewares/auth.middleware"

const router: Router = Router()

router.use(authMiddleware)

router.route("/c").post(toggleConnection)
router.route("/c/:userId/followers").get(getUserFollowers)
router.route("/c/:userId/following").get(getUserFollowing)

export default router
