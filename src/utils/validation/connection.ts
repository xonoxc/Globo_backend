import { z } from "zod"
import { uuidSchema } from "./uuid"

export const createConnectionValidationSchema = z.object({
     followingId: uuidSchema,
     followerId: uuidSchema,
})
