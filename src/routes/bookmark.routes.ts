import { Router } from "express"
import {
	getPostBookmarkStatus,
	getUserBookmarks,
	toggleBookmark,
} from "../controllers/bookmarks.controller"
import authMiddleware from "../middlewares/auth.middleware"

const router: Router = Router()

router.use(authMiddleware)

router.route("/usr/:userId").get(getUserBookmarks)

router.route("/t/:articleId").post(toggleBookmark)

router.route("/s/:articleId").get(getPostBookmarkStatus)

export default router
