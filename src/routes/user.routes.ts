import { Router } from "express"
import {
     getCurrentUser,
     getUserProfile,
     loginUser,
     logout,
     getUserSubscription,
     refreshAccessToken,
     registerUser,
     updateUserProfile,
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
router.route("/p/:userId").get(authMiddleware, getUserProfile)
router.route("/auth/refresh-token").post(refreshAccessToken)
router.route("/c/sub/:userId").get(authMiddleware, getUserSubscription)
router
     .route("/c")
     .get(authMiddleware, getCurrentUser)
     .patch(
          upload.fields([
               { name: "profile", maxCount: 1 },
               { name: "coverImage", maxCount: 1 },
          ])
     )
     .patch(authMiddleware, updateUserProfile)
router.route("/auth/logout").post(authMiddleware, logout)

export default router
