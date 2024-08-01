import { Request, Response, NextFunction } from "express"
import { ApiError } from "./apiError"

const asyncHandler = (requestHander: Function) => {
     return (req: Request, res: Response, next: NextFunction): void => {
          Promise.resolve(requestHander(req, res, next)).catch((error: any) => {
               if (error instanceof ApiError) {
                    res.status(error.statusCode).json({
                         success: false,
                         message: error.message,
                         errors: error.errors,
                         data: error.data,
                    })
               } else {
                    res.status(500).json({
                         success: false,
                         message: "Something went wrong",
                         errors: [error],
                         data: null,
                    })
               }
          })
     }
}

export default asyncHandler
