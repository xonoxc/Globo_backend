import { Router } from "express"
import {
     createComment,
     deleteComment,
     updateComment,
     getPostComments,
     getCommentReplies,
     getPostCommentCount,
} from "../controllers/comment.controller"
import authMiddleware from "../middlewares/auth.middleware"

const router: Router = Router()

router.use(authMiddleware)

router.route("/:articleId").get(getPostComments).post(createComment)

router
     .route("/co/:commentId")
     .patch(updateComment)
     .delete(deleteComment)
     .get(getCommentReplies)

router.route("/count/:postId").get(getPostCommentCount)

export default router
