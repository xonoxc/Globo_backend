import { prisma } from "../lib/prisma.client"
import { ApiError, ApiResponse, asyncHandler } from "../utils"
import signupValidationn from "../utils/validation/signup"
import { ApiRequest } from "../types/multerRequest"
import { cloudinary } from "../cloudinary"

const registerUser = asyncHandler(async (req: ApiRequest, res: Response) => {
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

     let uploadArgs: string[] = []
     const avatarLocalPath = req.files?.profile[0].path
     const coverLocalPath = req.files?.coverImage[0].path

     if (avatarLocalPath) {
          uploadArgs.push(avatarLocalPath)
     }

     if (coverLocalPath) {
          uploadArgs.push(coverLocalPath)
     }

     let uploadResult: string[] | null = []
     if (uploadArgs.length > 0) {
          const result = await cloudinary.uploadMultiple(uploadArgs)
          uploadResult = result
     }

     const newUser = await prisma.user.create({
          data: {
               name: parsedPayload.name,
               email: parsedPayload.email,
               password: parsedPayload.password,
               avatar: uploadResult ? uploadResult[0] : "",
               coverImage: uploadResult ? uploadResult[1] : "",
          },
     })

     return new ApiResponse(201, "User Created Successfully", {
          createdUser: newUser,
     })
})

const loginUser = asyncHandler(async (req: Request, res: Response) => {
     const payload = req.body
})

export { registerUser, loginUser }
