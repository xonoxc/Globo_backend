import { z } from "zod"

const envSchema = z.object({
     CLOUDINARY_CLOUD_NAME: z.string(),
     CLOUDINARY_API_KEY: z.string(),
     CLOUDINARY_API_SECRET: z.string(),
     CLOUDINARY_SECURE: z.boolean(),
     DATABASE_URL: z.string(),
})

export const env = envSchema.parse(process.env)
