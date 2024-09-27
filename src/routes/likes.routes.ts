import { Router } from "express"
import {
     togglePostLike,
     toggleCommentLike,
     getPostLikeStatus,
} from "../controllers/like.controller"
import authMiddleware from "../middlewares/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.route("/sts/:postId").get(getPostLikeStatus)
router.route("/:postId").post(togglePostLike)
router.route("/co/:commentId").post(toggleCommentLike)

export default router
