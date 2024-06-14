import { z } from "zod"

const loginSchema = z.object({
     email: z.string().email({ message: "invalid email" }),
     password: z
          .string()
          .min(8, { message: "password should be minimum 8 characters long" })
          .max(12, {
               message: "password can only be 12 characters long",
          }),
})

export default loginSchema
