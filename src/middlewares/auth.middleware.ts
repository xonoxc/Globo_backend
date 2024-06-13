import { NextFunction, Request, Response } from "express"
import { ApiError } from "../utils"
import { env } from "../utils/validation/env.validation"
import { asyncHandler } from "../utils"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma.client"
import { tokenPayload } from "../types/tokenPayload"

const authMiddleware = asyncHandler(
     async (req: Request, _: Response, next: NextFunction) => {
          try {
               const token =
                    req.cookies?.accessToken ||
                    req.header("Authorization")?.replace("Bearer", "")

               if (!token) throw new ApiError("Unauthorized Request!", 401)

               const decodedToken = jwt.verify(
                    token,
                    env.ACCESS_TOKEN_SECRET
               ) as tokenPayload

               const user = await prisma.user.findUnique({
                    where: {
                         id: decodedToken?.id,
                    },
               })

               if (!user) throw new ApiError("Invalid accessToken", 401)

               req.user = user

               next()
          } catch (err: any) {
               throw new ApiError("Unauthorized Request", 401, err.message)
          }
     }
)

export default authMiddleware
