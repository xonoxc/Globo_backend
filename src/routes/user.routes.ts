import { Router } from "express"
import { loginUser, registerUser } from "../controllers/user.controller"
import { upload } from "../middlewares/multer.middleware"

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

export default router
