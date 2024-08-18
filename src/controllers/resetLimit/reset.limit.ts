import { prisma } from "../../lib/prisma.client"
import { ApiError, asyncHandler } from "../../utils"
import { Request, Response } from "express"
import { env } from "../../utils/validation/env.validation"

const resetMothlyPostLimit = asyncHandler(
     async (req: Request, res: Response) => {
          const { password }: { password: string } = req.body

          if (password.trim() !== env.RESET_POST_PASSWORD) {
               throw new ApiError(
                    "authentication failure: incorrect password",
                    400
               )
          }

          const response = await prisma.userPreferences.updateMany({
               data: {
                    monthlyCount: 0,
               },
          })

          if (response)
               throw new ApiError(
                    "something went wrong while updating status",
                    500
               )

          return res.status(200).json({
               message: "post reset successfull!",
          })
     }
)

export { resetMothlyPostLimit }
