import { z } from "zod"

export const querySchema = z.object({
     query: z
          .string()
          .regex(
               /^[a-zA-Z0-9 ]*$/,
               "Query parameter contains special characters"
          ),
})
