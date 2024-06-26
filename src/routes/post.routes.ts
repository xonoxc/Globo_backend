import { Router } from "express"
import authMiddleware from "../middlewares/auth.middleware"
import { upload } from "../middlewares/multer.middleware"
import {
     createPost,
     deletePost,
     getAllPosts,
     getPostById,
     getUserPosts,
     updatePost,
} from "../controllers/post.controller"

const router: Router = Router()

router.use(authMiddleware)

router
     .route("/")
     .post(upload.fields([{ name: "image", maxCount: 1 }]))
     .post(createPost)
     .get(getUserPosts)

router.route("/:postId").get(getPostById).delete(deletePost)

router
     .route("/patch/:postId")
     .patch(upload.fields([{ name: "image", maxCount: 1 }]))
     .patch(updatePost)

router.route("/f/refresh").get(getAllPosts)

export default router
