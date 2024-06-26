import { Response } from "express"
import { ApiRequest } from "../types/ApiRequest"
import { ApiResponse, ApiError, asyncHandler } from "../utils"
import {
     postSchema,
     updatePostSchema,
} from "../utils/validation/post.validation"
import { cloudinary } from "../cloudinary"
import { prisma } from "../lib/prisma.client"
import { cache } from "../caching/redis"
import { Article } from "@prisma/client"

const createPost = asyncHandler(
     async (req: ApiRequest, res: Response): Promise<any> => {
          const payload = req.body

          const parsedPayload = postSchema.safeParse(payload)

          if (!parsedPayload.success)
               throw new ApiError(parsedPayload.error.message, 400)

          let imageSecureUrl: string | null = ""

          if (req.files && Array.isArray(req.files)) {
               if (req.files.image.length > 0) {
                    const imageLocalPath = req.files.image[0].path

                    imageSecureUrl = await cloudinary.uploadFile(imageLocalPath)
               }
          }

          const newPostdata = {
               title: parsedPayload.data.title,
               content: parsedPayload.data.content,
               image: imageSecureUrl || "",
               slug: parsedPayload.data.slug,
               status: parsedPayload.data.status,
               userId: Number(parsedPayload.data.userId),
          }

          const newPost = await prisma.article.create({
               data: newPostdata,
          })

          const cacheKey = `post:${newPost.id}`

          await cache.setValue(cacheKey, newPost)

          await cache.deleteValue("feed")

          return res.status(201).json(
               new ApiResponse(201, "Post created Successfully!", {
                    newPost,
               })
          )
     }
)

const getPostById = asyncHandler(async (req: ApiRequest, res: Response) => {
     const { postId } = req.params

     const parsedPostId = parseInt(postId.trim(), 10)

     if (!parsedPostId || isNaN(parsedPostId))
          throw new ApiError("PostId missing or invalid !", 400)

     const cacheKey = `post:${parsedPostId}`
     const cachedRecord = await cache.getValue(cacheKey)

     if (cachedRecord) {
          return res.status(200).json(
               new ApiResponse(200, "post fetched successfully!", {
                    post: cachedRecord,
               })
          )
     }

     const post = await prisma.article.findFirst({
          where: {
               id: parsedPostId,
          },
     })

     if (!post) throw new ApiError("Post not found!", 404)

     await cache.setValue(cacheKey, post)

     return res.status(200).json(
          new ApiResponse(200, "Post fetched successfully!", {
               post,
          })
     )
})

const getUserPosts = asyncHandler(async (req: ApiRequest, res: Response) => {
     const userId = req.user?.id

     const cacheKey = `postsBy:${userId}`
     const cachedRecord = await cache.getValue(cacheKey)

     if (cachedRecord) {
          return res.status(200).json(
               new ApiResponse(200, "All user posts fetched successfully!", {
                    posts: cachedRecord,
               })
          )
     }

     const userPosts = await prisma.article.findMany({
          where: {
               userId: userId,
          },
     })

     await cache.setValue(cacheKey, userPosts.length ? userPosts : [])

     return res.status(200).json(
          new ApiResponse(200, "All user posts fetched successfully!", {
               posts: userPosts.length > 0 ? userPosts : [],
          })
     )
})

const deletePost = asyncHandler(
     async (req: ApiRequest, res: Response): Promise<any> => {
          const { postId } = req.params

          const parsedPostId = parseInt(postId.trim(), 10)

          if (!parsedPostId || isNaN(parsedPostId))
               throw new ApiError("invalid or missing postId", 400)

          const deleteResponse = await prisma.article.delete({
               where: {
                    id: parsedPostId,
               },
          })

          if (deleteResponse) throw new ApiError("Article not found", 404)

          await cache.deleteValue(`post:${postId}`)

          await cache.deleteValue(`postsBy:${req.user?.id}`)

          return res
               .status(200)
               .json(new ApiResponse(200, "Article deleted successfully!", {}))
     }
)

const updatePost = asyncHandler(async (req: ApiRequest, res: Response) => {
     const { postId } = req.params
     const payload = req.body

     const parsedPostId = parseInt(postId.trim(), 10)

     if (!parsedPostId || isNaN(parsedPostId))
          throw new ApiError("Invalid or missing postId", 400)

     const validationResponse = updatePostSchema.safeParse(payload)

     if (!validationResponse.success) {
          throw new ApiError(validationResponse.error.message, 400)
     }

     const cacheKey = `post:${parsedPostId}`

     let oldPost = (await cache.getValue(cacheKey)) as Article | null

     if (!oldPost) {
          const oldPostResponse = await prisma.article.findUnique({
               where: {
                    id: parsedPostId,
               },
          })

          if (!oldPostResponse) throw new ApiError("Post not found", 404)

          oldPost = oldPostResponse

          await cache.setValue(cacheKey, oldPostResponse)
     }

     if (!oldPost) throw new ApiError("Post not found after cache set", 404)

     let updatedImageSecureUrl: string | null = null

     if (req.files && Array.isArray(req.files)) {
          if (req.files.image.length > 0) {
               const imageLocalPath = req.files.image[0].path

               const deletionResponse = await cloudinary.deleteFile(
                    oldPost.image as string
               )

               if (!deletionResponse) {
                    throw new ApiError("Image url corrupt", 500)
               }
               updatedImageSecureUrl =
                    await cloudinary.uploadFile(imageLocalPath)
          }
     }
     const updates = { ...validationResponse.data }

     if (updatedImageSecureUrl) {
          updates.image = updatedImageSecureUrl
     }

     const updateResponse = await prisma.article.update({
          where: {
               id: parsedPostId,
          },
          data: updates,
     })

     await cache.setValue(cacheKey, updateResponse)

     await cache.deleteValue(`postsBy:${req.user?.id}`)

     await cache.deleteValue("feed")

     return res.status(200).json(
          new ApiResponse(200, "Post updated successfully!", {
               updatedPost: updateResponse,
          })
     )
})

const getAllPosts = asyncHandler(
     async (req: ApiRequest, res: Response): Promise<any> => {
          const cacheKey = "feed"

          const cachedFeedValue = await cache.getValue(cacheKey)

          if (cachedFeedValue) {
               return res
                    .status(200)
                    .json(
                         new ApiResponse(
                              200,
                              "feed fetched successfully",
                              cachedFeedValue
                         )
                    )
          }

          const response = await prisma.article.findMany({
               where: {
                    status: "active",
               },
          })

          const currentApiResponse = new ApiResponse(
               200,
               response.length > 0
                    ? "feed fetched successfully"
                    : "no active posts yet",
               response.length > 0 ? response : []
          )

          await cache.setValue(cacheKey, currentApiResponse)

          return res.status(200).json(currentApiResponse)
     }
)

export {
     createPost,
     getPostById,
     getUserPosts,
     deletePost,
     updatePost,
     getAllPosts,
}
