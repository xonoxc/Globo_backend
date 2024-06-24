import { Request } from "express"
import { tokenPayload } from "./tokenPayload"

export interface ApiRequest extends Request {
     files?: {
          [fieldName: string]: Express.Multer.File[]
     }
     user?: tokenPayload
}
