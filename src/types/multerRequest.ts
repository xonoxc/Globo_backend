export interface ApiRequest extends Request {
     files?: {
          [fieldName: string]: Express.Multer.File[]
     }
}
