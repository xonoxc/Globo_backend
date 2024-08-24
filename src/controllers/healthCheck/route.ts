import { Request, Response } from "express"
import { ApiResponse } from "../../utils"

export const healthCheck = (_: Request, res: Response) => {
     return res
          .status(200)
          .json(new ApiResponse(200, "OK", "Health check passed"))
}
