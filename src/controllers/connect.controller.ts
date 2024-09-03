import { ApiError, ApiResponse, asyncHandler, uuidSchema } from "../utils"
import { ApiRequest } from "../types/ApiRequest"
import { Response } from "express"
import { createConnectionValidationSchema } from "../utils/validation/connection"
import { prisma } from "../lib/prisma.client"

const createConnection = asyncHandler(
     async (req: ApiRequest, res: Response) => {
          const { followingId, followerId } = req.body

          const validationResult = createConnectionValidationSchema.safeParse({
               followingId,
               followerId,
          })

          if (!validationResult.success) {
               throw new ApiError("Invalid payload provided!", 400, [
                    { ...validationResult.error, name: "validation error" },
               ])
          }

          const parsedPayload = validationResult.data

          const resultantConnection = await prisma.connection.create({
               data: {
                    followerId: parsedPayload.followerId,
                    followingId: parsedPayload.followingId,
               },
          })

          if (!resultantConnection)
               throw new ApiError("Cannot create connection!", 500)

          return res.status(201).json(
               new ApiResponse(201, "connection created successfully!", {
                    newConnection: resultantConnection,
               })
          )
     }
)

const deleteConnection = asyncHandler(
     async (req: ApiRequest, res: Response) => {
          const { connectionId } = req.params

          const validationResult = uuidSchema.safeParse(connectionId)
          if (!validationResult.success) {
               throw new ApiError("Invalid connection Id provided", 400, [
                    { ...validationResult.error, name: "validation error" },
               ])
          }
          const parsedConnectionId = validationResult.data

          const result = await prisma.connection.delete({
               where: {
                    id: parsedConnectionId,
               },
          })

          if (!result) throw new ApiError("Error deleting connection", 500)

          return res
               .status(200)
               .json(
                    new ApiResponse(200, "connection removed successfully!", {})
               )
     }
)

export { createConnection, deleteConnection }
