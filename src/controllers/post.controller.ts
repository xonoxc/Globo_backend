import { Response } from "express"
import { ApiRequest } from "../types/ApiRequest"
import { v4 as uuidv4 } from "uuid"
import { ApiResponse, ApiError, asyncHandler } from "../utils"
import {
     postSchema,
     updatePostSchema,
} from "../utils/validation/post.validation"
import { cloudinary } from "../cloudinary"
import { prisma } from "../lib/prisma.client"
import { cache } from "../caching/redis"
import { UserPreferences } from "@prisma/client"
import { Article } from "@prisma/client"

/*CONSTANTS*/
import { FREE_POST_LIMIT } from "../constants/constants"

/*CONTROLLERS*/
const createPost = asyncHandler(
     async (req: ApiRequest, res: Response): Promise<any> => {
          const payload = req.body

          const parsedPayload = postSchema.safeParse(payload)

          if (!parsedPayload.success)
               throw new ApiError("invalid properties", 400, [
                    { ...parsedPayload.error, name: "validation error" },
               ])

          let prefs = (await cache.getValue(
               `prefUserId:${req.user?.id}`
          )) as UserPreferences

          if (!prefs) {
               const response = await prisma.userPreferences.findUnique({
                    where: {
                         userId: String(req.user?.id),
                    },
               })

               prefs = response as UserPreferences
          }

          if (prefs.articleCount === FREE_POST_LIMIT && !prefs.proUser) {
               throw new ApiError("free plan limit reached", 405)
          }

          let imageSecureUrl: string | null = ""

          if (req.files && Array.isArray(req.files.image)) {
               if (req.files.image.length > 0) {
                    const imageLocalPath = req.files.image[0].path

                    imageSecureUrl = await cloudinary.uploadFile(imageLocalPath)
               }
          }

          const postTransaction = await prisma.$transaction(async (prisma) => {
               const updated = await prisma.userPreferences.update({
                    where: { userId: String(req.user?.id) },
                    data: { articleCount: { increment: 1 } },
               })
               if (!updated) {
                    throw new ApiError("Error updating preferences", 500)
               }

               const newPostData = {
                    id: uuidv4(),
                    title: parsedPayload.data.title,
                    content: parsedPayload.data.content,
                    image: imageSecureUrl || "",
                    slug: parsedPayload.data.slug,
                    status: parsedPayload.data.status,
                    userId: req.user?.id as string,
               }

               const newPost = await prisma.article.create({
                    data: newPostData,
               })

               await cache.setValue(`prefUserId:${newPost.userId}`, updated)
               await cache.setValue(`post:${newPost.id}`, newPost)
               await cache.deleteValue("feed")
               await cache.deleteValue(`postsBy:${newPost.userId}`)

               return newPost
          })

          const newPost = postTransaction

          return res.status(201).json(
               new ApiResponse(201, "Post created Successfully!", {
                    newPost,
               })
          )
     }
)

const getPostById = asyncHandler(async (req: ApiRequest, res: Response) => {
     const { postId } = req.params

     const parsedPostId = postId.trim()

     if (!parsedPostId || parsedPostId.length === 0)
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

     return res
          .status(200)
          .json(new ApiResponse(200, "Post fetched successfully!", post))
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

          const parsedPostId = postId.trim()

          if (!parsedPostId || parsedPostId.length === 0)
               throw new ApiError("invalid or missing postId", 400)

          const deleteResponse = await prisma.article.delete({
               where: {
                    id: parsedPostId,
               },
          })

          if (!deleteResponse) throw new ApiError("Article not found", 404)

          if (deleteResponse.image) {
               const deletedAsset = await cloudinary.deleteFile(
                    deleteResponse.image as string
               )

               if (!deletedAsset) {
                    throw new ApiError(
                         "Error occured while deleting asset",
                         500
                    )
               }
          }

          await cache.deleteValue(`post:${postId}`)
          await cache.deleteValue("feed")

          await cache.deleteValue(`postsBy:${req.user?.id}`)

          return res
               .status(200)
               .json(new ApiResponse(200, "Article deleted successfully!", {}))
     }
)

const updatePost = asyncHandler(async (req: ApiRequest, res: Response) => {
     const { postId } = req.params
     const payload = req.body

     const parsedPostId = postId.trim()

     if (!parsedPostId) throw new ApiError("Invalid or missing postId", 400)

     const validationResponse = updatePostSchema.safeParse(payload)

     if (!validationResponse.success) {
          throw new ApiError("invalid properties", 400, [
               { ...validationResponse.error, name: "validation error" },
          ])
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
     async (_: ApiRequest, res: Response): Promise<any> => {
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

          const posts = await prisma.article.findMany({
               where: {
                    status: "active",
               },
               include: {
                    User: {
                         select: {
                              name: true,
                              avatar: true,
                         },
                    },
               },
          })

          const currentApiResponse = new ApiResponse(
               200,
               posts.length > 0
                    ? "feed fetched successfully"
                    : "no active posts yet",
               posts
          )

          await cache.setValue(cacheKey, currentApiResponse)

          return res.status(200).json(currentApiResponse)
     }
)

const getImagePreview = asyncHandler(
     async (req: ApiRequest, res: Response): Promise<any> => {
          const { postId } = req.params

          const parsetPostId = postId.trim()

          if (!parsetPostId || parsetPostId.length === 0)
               throw new ApiError("Missing or Invalid postId", 400)

          const cacheKey = `post:${parsetPostId}`

          const chachePost = (await cache.getValue(cacheKey)) as Article | null

          if (chachePost) {
               return res.status(200).json(
                    new ApiResponse(200, "Image preview fetch successful", {
                         image_url: chachePost.image,
                    })
               )
          }

          const dbPost = await prisma.article.findUnique({
               where: {
                    id: parsetPostId,
               },
          })

          if (!dbPost) {
               throw new ApiError("Post not found!", 404)
          }

          await cache.setValue(cacheKey, dbPost)

          return res.status(200).json(
               new ApiResponse(200, "Image preview fetch successful", {
                    image_url: dbPost.image,
               })
          )
     }
)

export {
     createPost,
     getImagePreview,
     getPostById,
     getUserPosts,
     deletePost,
     updatePost,
     getAllPosts,
}
