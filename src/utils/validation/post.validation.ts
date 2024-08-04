import { z } from "zod"

const postSchema = z.object({
     title: z
          .string()
          .min(2, { message: "title cannot be less than 2 characters" })
          .max(100, { message: "title cannot be more than 100 characters" }),
     content: z
          .string()
          .min(10, { message: "Content cannot be less than 10 characters" })
          .max(10000, {
               message: "Content cannot be more than 10000 characters",
          })
          .min(10, { message: "Content cannot be less than 10 characters" }),
     slug: z.string(),
     status: z.string(),
})

const updatePostSchema = z.object({
     title: z
          .string()
          .max(100, { message: "title cannot be more than 100" })
          .min(2, { message: "title cannot be less than 2 characters" })
          .optional(),
     image: z.string().optional(),
     status: z.string().optional(),
     content: z
          .string()
          .min(10, { message: "Content cannot be less than 10 characters" })
          .max(1000, { message: "Image cannot be more than 1000 characters" })
          .optional(),
})

export { postSchema, updatePostSchema }
