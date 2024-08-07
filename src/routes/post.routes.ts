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
     updatePost,
     getSearchResults,
     getSearchSuggestions,
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

router.route("/s/post").get(authMiddleware, getSearchResults)

router.route("/suggest/posts").get(authMiddleware, getSearchSuggestions)

router.route("/i/prev/:postId").get(getImagePreview)

router
     .route("/patch/:postId")
     .patch(upload.fields([{ name: "image", maxCount: 1 }]))
     .patch(updatePost)

router.route("/f/refresh").get(getAllPosts)

export default router
