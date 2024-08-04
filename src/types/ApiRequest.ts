import { Request } from "express"
import { User } from "@prisma/client"

export interface ApiRequest extends Request {
     files?: {
          [fieldName: string]: Express.Multer.File[]
     }
     user?: User
}
