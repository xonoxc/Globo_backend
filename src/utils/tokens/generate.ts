import { User } from "@prisma/client"
import { env } from "../validation/env.validation"
import jwt from "jsonwebtoken"

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

export { generateAccessToken, generateRefreshToken }
