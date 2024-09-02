import { asyncHandler } from "../utils"
import { ApiRequest } from "../types/ApiRequest"

const createConnection = asyncHandler(
     async (req: ApiRequest, res: Response) => {}
)

const deleteConnection = asyncHandler(
     async (req: ApiRequest, res: Response) => {}
)

export { createConnection, deleteConnection }
