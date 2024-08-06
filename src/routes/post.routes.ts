import { Router } from "express"
import authMiddleware from "../middlewares/auth.middleware"
import { upload } from "../middlewares/multer.middleware"
import {
     createPost,
     deletePost,
     getAllPosts,
     getImagePreview,
     getPostById,
     getUserPosts,
     handleSearchQuery,
     updatePost,
} from "../controllers/post.controller"

const router: Router = Router()

router.use(authMiddleware)

/* controllers imports */

router
     .route("/")
     .post(upload.fields([{ name: "image", maxCount: 1 }]))
     .post(createPost)
     .get(getUserPosts)

router.route("/:postId").get(getPostById).delete(deletePost)

router.route("/i/prev/:postId").get(getImagePreview)

router
     .route("/patch/:postId")
     .patch(upload.fields([{ name: "image", maxCount: 1 }]))
     .patch(updatePost)

router.route("/f/refresh").get(getAllPosts)
router.route("/search").get(authMiddleware, handleSearchQuery)

export default router
