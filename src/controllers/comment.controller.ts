import { prisma } from "../lib/prisma.client"
import { ApiRequest } from "../types/ApiRequest"
import { Response } from "express"
import { ApiError, ApiResponse, asyncHandler, uuidSchema } from "../utils"
import {
     commentBodyValidationSchema,
     updateCommentValidationSchema,
} from "../utils/validation/comment"
import { cache } from "../caching/redis"

const createComment = asyncHandler(async (req: ApiRequest, res: Response) => {
     const { articleId } = req.params
     const { content, parentId } = req.body

     const validationResult = commentBodyValidationSchema.safeParse({
          articleId,
          content,
          parentId,
     })

     if (!validationResult.success) {
          throw new ApiError("invalid credentials", 400, [
               { ...validationResult.error, name: "validation error" },
          ])
     }

     const parsedPayload = validationResult.data
     const userId = req.user?.id

     const creationData: {
          articleId: string
          content: string
          userId: string
          parentId?: string
     } = {
          articleId: parsedPayload.articleId,
          content: parsedPayload.content,
          userId: userId as string,
     }

     if (parsedPayload.parentId) {
          creationData.parentId = parsedPayload.parentId
     }

     const createdComment = await prisma.comment.create({
          data: creationData,
          include: {
               user: {
                    select: {
                         id: true,
                         name: true,
                         avatar: true,
                    },
               },
               _count: {
                    select: {
                         replies: true,
                         likes: true,
                    },
               },
          },
     })

     if (!createdComment)
          throw new ApiError("Error while creating comment", 500)

     await cache.deleteValue(`commentCountId:${parsedPayload.articleId}`)
     await cache.deleteMatchingKeys(
          `commentsId:${parsedPayload.articleId}-page:*`
     )
     await cache.deleteValue(`stats:${parsedPayload.articleId}`)

     return res
          .status(201)
          .json(
               new ApiResponse(
                    200,
                    "comment created successfully!",
                    createdComment
               )
          )
})

const getPostComments = asyncHandler(async (req: ApiRequest, res: Response) => {
     const { articleId } = req.params
     const { page = 1 } = req.query

     const validationResult = uuidSchema.safeParse(articleId)
     if (!validationResult.success) {
          throw new ApiError("Invalid article id", 400, [
               { ...validationResult.error, name: "validation result" },
          ])
     }

     const cacheKey = `commentsId:${articleId}-page:${page}`

     let cacheResult = await cache.getValue(cacheKey)
     if (cacheResult) {
          return res.status(200).json(
               new ApiResponse(
                    200,
                    "Comments fetched successfully (from cache)!",
                    {
                         comments: cacheResult,
                    }
               )
          )
     }

     const pageSize = 5
     const skip = (Number(page) - 1) * pageSize

     const comments = await prisma.comment.findMany({
          where: {
               articleId: articleId,
               parentId: null,
          },
          include: {
               user: {
                    select: {
                         id: true,
                         name: true,
                         avatar: true,
                    },
               },
               replies: {
                    include: {
                         user: {
                              select: {
                                   id: true,
                                   name: true,
                                   avatar: true,
                              },
                         },
                    },
                    orderBy: {
                         createdAt: "asc",
                    },
               },
               _count: {
                    select: {
                         replies: true,
                         likes: true,
                    },
               },
          },
          orderBy: {
               createdAt: "desc",
          },
          skip,
          take: pageSize,
     })

     if (!comments) throw new ApiError("Error while fetching comments", 500)

     await cache.setValue(cacheKey, comments)

     return res.status(200).json(
          new ApiResponse(200, "Comments fetched successfully!", {
               comments,
          })
     )
})

const updateComment = asyncHandler(async (req: ApiRequest, res: Response) => {
     const { commentId } = req.params
     const { newContent } = req.body

     const validationResult = updateCommentValidationSchema.safeParse({
          commentId,
          newContent,
     })
     if (!validationResult.success) {
          throw new ApiError("invalid request payload ", 400, [
               { ...validationResult.error, name: "validation result" },
          ])
     }

     const parsedPayload = validationResult.data

     const updateResult = await prisma.comment.update({
          where: {
               id: parsedPayload.commentId,
          },
          data: {
               content: parsedPayload.newContent,
          },
     })

     if (!updateResult) throw new ApiError("error while updating comment", 500)

     await cache.deleteValue(`commentId:${parsedPayload.commentId}`)

     return res
          .status(200)
          .json(new ApiResponse(200, "comment update success!", updateResult))
})

const deleteComment = asyncHandler(async (req: ApiRequest, res: Response) => {
     const { commentId } = req.params

     const validationResult = uuidSchema.safeParse(commentId)
     if (!validationResult.success) {
          throw new ApiError("invalid commentId Provided!", 400, [
               { ...validationResult.error, name: "validation error" },
          ])
     }

     const parsedCommentId = validationResult.data

     const delteResult = await prisma.comment.delete({
          where: {
               id: parsedCommentId,
          },
     })

     if (!delteResult) throw new ApiError("Cannot delete comment", 500)

     await cache.deleteValue(`commentCountId:${delteResult.articleId}`)
     await cache.deleteMatchingKeys(
          `commentsId:${delteResult.articleId}-page:*`
     )
     await cache.deleteValue(`stats:${delteResult.articleId}`)

     return res
          .status(200)
          .json(new ApiResponse(200, "Comment deleted successfully", {}))
})

const getPostCommentCount = asyncHandler(
     async (req: ApiRequest, res: Response) => {
          const { postId } = req.params

          const validationResult = uuidSchema.safeParse(postId)
          if (!validationResult.success) {
               throw new ApiError("Invalid post id", 400, [
                    { ...validationResult.error, name: "validation result" },
               ])
          }

          const cacheKey = `commentCountId:${postId}`

          let cacheResult = (await cache.getValue(cacheKey)) as {
               commentCount: number
          }
          if (cacheResult) {
               return res.status(200).json(
                    new ApiResponse(200, "comment count fetch success!", {
                         commentCount: cacheResult.commentCount,
                    })
               )
          }

          const parsedPostId = validationResult.data

          const commentCount = await prisma.comment.count({
               where: {
                    articleId: parsedPostId,
               },
          })

          if (!commentCount)
               throw new ApiError("Error while getting comment count", 500)

          await cache.setValue(cacheKey, { commentCount })

          return res.status(200).json(
               new ApiResponse(200, "comment count fetch success!", {
                    commentCount,
               })
          )
     }
)

const getCommentLikedStatus = asyncHandler(
     async (req: ApiRequest, res: Response) => {
          const { commentId } = req.params

          const validationResult = uuidSchema.safeParse(commentId)
          if (!validationResult.success) {
               throw new ApiError("invalid comment Id", 400, [
                    { ...validationResult.error, name: "validation error" },
               ])
          }

          const parsedCommentId = validationResult.data

          const likedStatus = await prisma.like.findFirst({
               where: {
                    AND: [
                         { parentCommentId: parsedCommentId },
                         { userId: req.user?.id as string },
                    ],
               },
          })

          return res.status(200).json(
               new ApiResponse(200, "success!", {
                    status: !!likedStatus,
               })
          )
     }
)

export {
     createComment,
     getCommentLikedStatus,
     deleteComment,
     updateComment,
     getPostComments,
     getPostCommentCount,
}
