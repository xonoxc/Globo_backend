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
     })

     if (!createdComment)
          throw new ApiError("Error while creating comment", 500)

     await cache.deleteValue(`commentsPostId${parsedPayload.articleId}`)

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

     const validationResult = uuidSchema.safeParse(articleId)
     if (!validationResult.success) {
          throw new ApiError("Invalid post id", 400, [
               { ...validationResult.error, name: "validation result" },
          ])
     }

     const cacheKey = `commentsPostId${articleId}`

     let cacheResult = await cache.getValue(cacheKey)
     if (cacheResult) {
          return res
               .status(200)
               .json(
                    new ApiResponse(200, "comment fetch success!", cacheResult)
               )
     }

     const comments = await prisma.comment.findMany({
          where: {
               AND: [
                    {
                         articleId: articleId,
                    },
                    {
                         parentId: null,
                    },
               ],
          },
     })

     if (!comments) throw new ApiError("Error while getting post comments", 500)

     await cache.setValue(cacheKey, comments)

     return res
          .status(200)
          .json(new ApiResponse(200, "comment fetch success!", comments))
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

     await cache.deleteValue(`commentsPostId${updateResult.articleId}`)

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

     return res
          .status(200)
          .json(new ApiResponse(200, "Comment deleted successfully", {}))
})

const getCommentReplies = asyncHandler(
     async (req: ApiRequest, res: Response) => {
          const { commentId } = req.params

          const validationResult = uuidSchema.safeParse(commentId)
          if (!validationResult.success) {
               throw new ApiError("Invalid comment id", 400, [
                    { ...validationResult.error, name: "validation result" },
               ])
          }

          const cacheKey = `repliesCommentId${commentId}`

          let cacheResult = await cache.getValue(cacheKey)
          if (cacheResult) {
               return res
                    .status(200)
                    .json(
                         new ApiResponse(
                              200,
                              "comment replies fetch success!",
                              cacheResult
                         )
                    )
          }

          const parsedCommentId = validationResult.data

          const replies = await prisma.comment.findMany({
               where: {
                    parentId: parsedCommentId,
               },
          })

          if (!replies)
               throw new ApiError("Error while getting comment replies", 500)

          await cache.setValue(cacheKey, replies)

          return res
               .status(200)
               .json(
                    new ApiResponse(
                         200,
                         "comment replies fetch success!",
                         replies
                    )
               )
     }
)

export {
     createComment,
     deleteComment,
     updateComment,
     getPostComments,
     getCommentReplies,
}
