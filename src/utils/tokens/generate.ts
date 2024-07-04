import { User } from "@prisma/client"
import { env } from "../validation/env.validation"
import jwt from "jsonwebtoken"
import { prisma } from "../../lib/prisma.client"
import { ApiError } from "../apiError"

type tokenResponse = { accessToken: string; refreshToken: string }

const generateTokens = async (userId: number): Promise<tokenResponse> => {
     try {
          const response = await prisma.user.findUnique({
               where: {
                    id: userId,
               },
          })

          if (!response) {
               throw new ApiError("User not found", 404)
          }

          const accessToken = generateAccessToken(response as User)
          const refreshToken = generateRefreshToken(response as User)

          await prisma.user.update({
               where: { id: userId },
               data: {
                    refreshToken,
               },
          })

          return { accessToken, refreshToken }
     } catch (error) {
          throw new ApiError(`Error generating jwt tokens : ${error}`, 500)
     }
}

const generateAccessToken = (user: User): string => {
     return jwt.sign(
          {
               id: user.id,
               email: user.email,
               username: user.name,
          },
          env.ACCESS_TOKEN_SECRET,
          {
               expiresIn: env.ACCESS_TOKEN_EXPIRY,
          }
     )
}

const generateRefreshToken = (user: User): string => {
     return jwt.sign(
          {
               id: user.id,
               email: user.email,
               username: user.name,
          },
          env.REFRESH_TOKEN_SECRET,
          {
               expiresIn: env.REFRESH_TOKEN_EXPIRY,
          }
     )
}

export { generateTokens }
