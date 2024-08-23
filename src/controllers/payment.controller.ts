import { prisma } from "../lib/prisma.client"
import { ApiRequest } from "../types/ApiRequest"
import { ApiError, ApiResponse, asyncHandler } from "../utils"
import paymentSchema from "../utils/validation/payment"
import { Response } from "express"

const createSubscription = asyncHandler(
     async (request: ApiRequest, response: Response) => {
          const body = request.body

          console.log(body)

          const parsedPayload = paymentSchema.safeParse(body)

          if (!parsedPayload.success) {
               throw new ApiError("invalid properties:", 400, [
                    { ...parsedPayload.error, name: "validation error" },
               ])
          }

          const user_id = request.user?.id

          const updateResult = await prisma.userPreferences.update({
               where: {
                    userId: user_id as string,
               },
               data: {
                    proUser: true,
               },
          })

          if (!updateResult) {
               throw new ApiError("error while creating subscription!", 400)
          }

          return response
               .status(200)
               .json(
                    new ApiResponse(200, "Subscription added successfully!", {})
               )
     }
)

export { createSubscription }
