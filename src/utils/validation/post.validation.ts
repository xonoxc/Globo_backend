import { z } from "zod"

const postSchema = z.object({
     title: z
          .string()
          .max(100, { message: "title cannot be more than 100 characters" }),
     content: z.string().max(1000, {
          message: "Content cannot be more than 1000 characters",
     }),
     slug: z.string(),
     status: z.string(),
     userId: z.string(),
})

const updatePostSchema = z.object({
     title: z.string().optional(),
     image: z.string().optional(),
     status: z.string().optional(),
     content: z.string().optional(),
})

export { postSchema, updatePostSchema }
