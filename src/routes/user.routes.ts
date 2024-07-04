import { Router } from "express"
import {
     getCurrentUser,
     loginUser,
     logout,
     refreshAccessToken,
     registerUser,
} from "../controllers/user.controller"
import { upload } from "../middlewares/multer.middleware"
import authMiddleware from "../middlewares/auth.middleware"

const router: Router = Router()

/* controllers imports */

router
     .route("/auth/signup")
     .post(
          upload.fields([
               { name: "profile", maxCount: 1 },
               { name: "coverImage", maxCount: 1 },
          ])
     )
     .post(registerUser)

router.route("/auth/login").post(loginUser)
router.route("/auth/refresh-token").post(refreshAccessToken)
router.route("/c").get(authMiddleware, getCurrentUser)
router.route("/auth/logout").post(authMiddleware, logout)

export default router
