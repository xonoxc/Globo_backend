import { z } from "zod"

export const commentBodyValidationSchema = z.object({
	articleId: z.string().uuid({ message: "invalid article id!" }),
	content: z
		.string()
		.min(1, { message: "comments cannot be empty!" })
		.max(1200, { message: "comment can be maximum 1000 characters!" }),
	parentId: z.string().uuid({ message: "invalid comment id!" }).optional(),
})

export const updateCommentValidationSchema = z.object({
	commentId: z.string().uuid({ message: "invalid comment id!" }),
	newContent: z
		.string()
		.min(5, { message: "comment should be atleast 5 characters" })
		.max(1200, { message: "comment can be maximum 1000 characters!" }),
})
