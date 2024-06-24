import { prisma } from "../lib/prisma.client"
import { CookieOptions, Response } from "express"
import { ApiError, ApiResponse, asyncHandler } from "../utils"
import bcrypt from "bcryptjs"
import signupValidationn from "../utils/validation/signup"
import { ApiRequest } from "../types/ApiRequest"
import { cloudinary } from "../cloudinary"
import loginSchema from "../utils/validation/login"
import {
     generateRefreshToken,
     generateAccessToken,
} from "../utils/tokens/generate"
import { isPasswordCorrect } from "../utils/password/check"
import { User } from "@prisma/client"

/* CONSTANTS */

const BCRYPT_SALT_ROUNDS = 10
const COOKIE_OPTIONS: CookieOptions = {
     httpOnly: true,
     secure: true,
}

/* CONTROLLERS */

const registerUser = asyncHandler(
     async (req: ApiRequest, res: Response): Promise<any> => {
          const payload = req.body

          const validationResult = signupValidationn.safeParse(payload)

          if (!validationResult.success)
               throw new ApiError(validationResult.error.message, 400)

          const parsedPayload = validationResult.data

          const exisitingUser = await prisma.user.findFirst({
               where: {
                    OR: [
                         { email: parsedPayload.email },
                         { name: parsedPayload.name },
                    ],
               },
          })

          if (exisitingUser)
               throw new ApiError(
                    "User with that given username or email already exists",
                    400
               )

          let uploadResult: (string | null)[] = []

          if (req.files) {
               const fileUpload = []
               if (req.files.profile && req.files.profile.length > 0) {
                    const avatarLocalPath = req.files.profile[0].path
                    fileUpload.push(cloudinary.uploadFile(avatarLocalPath))
               }

               if (req.files.coverImage && req.files.coverImage.length > 0) {
                    const coverImageLocalPath = req.files.coverImage[0].path
                    fileUpload.push(cloudinary.uploadFile(coverImageLocalPath))
               }
               uploadResult = await Promise.all(fileUpload)
          }

          const hashedPassword = await bcrypt.hash(
               parsedPayload.password,
               BCRYPT_SALT_ROUNDS
          )

          const newUser = await prisma.user.create({
               data: {
                    name: parsedPayload.name,
                    email: parsedPayload.email,
                    password: hashedPassword,
                    avatar: uploadResult.length > 0 ? uploadResult[0] : "",
                    coverImage: uploadResult.length > 1 ? uploadResult[1] : "",
               },
          })

          const apiResponse = new ApiResponse(201, "User created sucessfully", {
               createdUser: {
                    name: newUser.name,
                    email: newUser.email,
                    avatar: uploadResult.length > 0 ? uploadResult[0] : "",
                    coverImage: uploadResult.length > 1 ? uploadResult[1] : "",
               },
          })

          return res.json(apiResponse)
     }
)

const loginUser = asyncHandler(async (req: ApiRequest, res: Response) => {
     const payload = req.body

     const parsedPayload = loginSchema.safeParse(payload)

     if (!parsedPayload.success) {
          throw new ApiError(parsedPayload.error.message, 400)
     }

     const existingUser = await prisma.user.findFirst({
          where: {
               email: parsedPayload.data.email,
          },
     })

     if (!existingUser) {
          throw new ApiError("No user with given email", 404)
     }

     const correctPassword = await isPasswordCorrect(
          existingUser.password,
          parsedPayload.data.password
     )

     if (!correctPassword)
          throw new ApiError("[Authenticatio failed]; incorrect password", 400)

     const [accessToken, refreshToken] = await Promise.all([
          generateAccessToken(existingUser),
          generateRefreshToken(existingUser),
     ])

     const loggedInUser = await prisma.user.findUnique({
          where: {
               id: existingUser.id,
          },
          select: {
               id: true,
               name: true,
               email: true,
               avatar: existingUser.avatar ? true : false,
               coverImage: existingUser.coverImage ? true : false,
          },
     })

     return res
          .status(200)
          .cookie("accessToken", accessToken, COOKIE_OPTIONS)
          .cookie("refreshToken", accessToken, COOKIE_OPTIONS)
          .json(
               new ApiResponse(200, "User logged in sucessfully", {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
               })
          )
})

const getCurrentUser = asyncHandler(
     async (req: ApiRequest, res: Response): Promise<any> => {
          const user = req.user as User

          return res.status(200).json(
               new ApiResponse(200, "User fetch success!", {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    coverImage: user.coverImage,
               })
          )
     }
)

const logout = asyncHandler(
     async (_: ApiRequest, res: Response): Promise<any> => {
          return res
               .status(200)
               .clearCookie("accessToken")
               .clearCookie("refreshToken")
               .json(new ApiResponse(200, "User logged out successfully!", {}))
     }
)

export { registerUser, loginUser, getCurrentUser, logout }
