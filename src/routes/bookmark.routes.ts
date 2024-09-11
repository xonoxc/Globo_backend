import { Router } from "express"
import {
     getUserBookmarks,
     toggleBookmark,
} from "../controllers/bookmarks.controller"
import authMiddleware from "../middlewares/auth.middleware"

const router: Router = Router()

router.use(authMiddleware)

router.route("/c/usr").get(getUserBookmarks)

router.route("/t/:articleId").post(toggleBookmark)

export default router
