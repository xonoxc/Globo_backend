import { z } from "zod"

const updateUserSchema = z.object({
     name: z
          .string()
          .max(100, { message: "name cannot be more than 100" })
          .min(2, { message: "name cannot be less than 2 characters" })
          .optional(),
     email: z.string().email({ message: "invalid email" }).optional(),
     password: z
          .string()
          .min(8, { message: "password should be minimum 8 characters long" })
          .max(12, {
               message: "password can only be 12 characters long",
          })
          .optional(),
     profile: z.string().optional(),
     coverImage: z.string().optional(),
     bio: z
          .string()
          .max(1000, { message: "bio cannot be more than 1000" })
          .min(10, { message: "bio cannot be less than 10 characters" })
          .optional(),
})

export { updateUserSchema }
