import { ApiError, ApiResponse, asyncHandler, uuidSchema } from "../utils"
import { ApiRequest } from "../types/ApiRequest"
import { Response } from "express"
import { prisma } from "../lib/prisma.client"
import { cache } from "../caching/redis"

const toggleBookmark = asyncHandler(async (req: ApiRequest, res: Response) => {
     const { articleId } = req.params

     const validationResult = uuidSchema.safeParse(articleId)
     if (!validationResult.success) {
          throw new ApiError("Invalid article id!", 400, [
               { ...validationResult.error, name: "validation error" },
          ])
     }

     const parsedArticleId = validationResult.data

     const ownerId = req.user?.id as string

     const resultant = await prisma.$transaction(async prisma => {
          const eixstingBookmark = await prisma.bookmark.findFirst({
               where: {
                    AND: [{ ownerId: ownerId }, { articleId: parsedArticleId }],
               },
          })

          if (!eixstingBookmark) {
               return await prisma.bookmark.create({
                    data: {
                         articleId: parsedArticleId,
                         ownerId: ownerId,
                    },
               })
          }

          return await prisma.bookmark.delete({
               where: {
                    id: eixstingBookmark.id,
               },
          })
     })

     if (!resultant) throw new ApiError("Cannot toggle bookmark!", 500)

     await cache.deleteValue(`bookmarksBy:${ownerId}`)

     return res.status(201).json(
          new ApiResponse(201, "Bookmark toggled successfully!", {
               resultant,
          })
     )
})

const getUserBookmarks = asyncHandler(
     async (req: ApiRequest, res: Response) => {
          const userId = req.user?.id as string

          const cacheKey = `bookmarksBy:${userId}`

          let cacheResult = await cache.getValue(cacheKey)
          if (cacheResult) {
               return res
                    .status(200)
                    .json(
                         new ApiResponse(
                              200,
                              "Bookmarks fetched successfully!",
                              cacheResult
                         )
                    )
          }

          const bookmarks = await prisma.bookmark.findMany({
               where: {
                    ownerId: userId,
               },
               select: {
                    articleId: true,
               },
               orderBy: {
                    createdAt: "desc",
               },
          })

          await cache.setValue(cacheKey, bookmarks)

          return res
               .status(200)
               .json(
                    new ApiResponse(
                         200,
                         "Bookmarks fetched successfully!",
                         bookmarks
                    )
               )
     }
)

export { toggleBookmark, getUserBookmarks }
