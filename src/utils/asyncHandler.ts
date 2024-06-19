import { Request, Response, NextFunction } from "express"

const asyncHandler = (requestHander: Function) => {
     return (req: Request, res: Response, next: NextFunction): void => {
          Promise.resolve(requestHander(req, res, next)).catch((error: any) =>
               next(error)
          )
     }
}

export default asyncHandler
