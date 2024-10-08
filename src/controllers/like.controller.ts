import { prisma } from "../lib/prisma.client"
import { ApiRequest } from "../types/ApiRequest"
import { Response } from "express"
import { ApiError, ApiResponse, asyncHandler, uuidSchema } from "../utils"
import { cache } from "../caching/redis"

const togglePostLike = asyncHandler(async (req: ApiRequest, res: Response) => {
     const { postId } = req.params

     const validationResult = uuidSchema.safeParse(postId)
     if (!validationResult.success) {
          throw new ApiError("Invalid post id provided!", 400, [
               { ...validationResult.error, name: "validtion error" },
          ])
     }
     const parsedPostId = validationResult.data

     const userId = req.user?.id as string

     const result = await prisma.$transaction(async prisma => {
          const existingLike = await prisma.like.findFirst({
               where: {
                    AND: [{ articleId: parsedPostId }, { userId: userId }],
               },
          })

          if (!existingLike) {
               return await prisma.like.create({
                    data: {
                         articleId: parsedPostId,
                         userId: userId,
                    },
               })
          }

          return await prisma.like.delete({
               where: {
                    id: existingLike.id,
               },
          })
     })

     if (!result) throw new ApiError("Cannot toggle like", 500)

     await cache.deleteValue(`stats:${parsedPostId}`)

     return res
          .status(200)
          .json(new ApiResponse(200, "like toggled successfully!", {}))
})

const toggleCommentLike = asyncHandler(
     async (req: ApiRequest, res: Response) => {
          const { commentId } = req.params

          const validationResult = uuidSchema.safeParse(commentId)
          if (!validationResult.success) {
               throw new ApiError("Invalid comment id provided!", 400, [
                    { ...validationResult.error, name: "validtion error" },
               ])
          }

          const parsedCommentId = validationResult.data

          const userId = req.user?.id as string

          const result = await prisma.$transaction(async prisma => {
               const existingLike = await prisma.like.findFirst({
                    where: {
                         AND: [
                              {
                                   parentCommentId: parsedCommentId,
                              },
                              { userId: userId },
                         ],
                    },
               })

               if (!existingLike) {
                    return await prisma.like.create({
                         data: {
                              parentCommentId: parsedCommentId,
                              userId: userId,
                         },
                    })
               }

               return await prisma.like.delete({
                    where: {
                         id: existingLike.id,
                    },
               })
          })

          if (!result) throw new ApiError("Cannot toggle like", 500)

          await cache.deleteValue(`repliesCommentId:${parsedCommentId}`)
          await cache.deleteValue(`commentsId:${result.articleId}`)

          return res
               .status(200)
               .json(new ApiResponse(200, "like toggled successfully!", {}))
     }
)

const getPostLikeStatus = asyncHandler(
     async (req: ApiRequest, res: Response) => {
          const { postId } = req.params

          const validationResult = uuidSchema.safeParse(postId)
          if (!validationResult.success) {
               throw new ApiError("Invalid post id provided!", 400, [
                    { ...validationResult.error, name: "validtion error" },
               ])
          }

          const parsedPostId = validationResult.data

          const userId = req.user?.id as string

          const result = await prisma.like.findFirst({
               where: {
                    AND: [{ articleId: parsedPostId }, { userId: userId }],
               },
          })

          return res.status(200).json(
               new ApiResponse(200, "success!", {
                    likeStatus: !!result,
               })
          )
     }
)

export { toggleCommentLike, togglePostLike, getPostLikeStatus }
