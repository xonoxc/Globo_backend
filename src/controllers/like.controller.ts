import { ApiRequest } from "../types/ApiRequest"
import { asyncHandler } from "../utils"

const createPostLike = asyncHandler(
     async (req: ApiRequest, res: Response) => {}
)

const deletePostLike = asyncHandler(
     async (req: ApiRequest, res: Response) => {}
)

const createCommentLike = asyncHandler(
     async (req: ApiRequest, res: Response) => {}
)

const deleteCommentLike = asyncHandler(
     async (req: ApiRequest, res: Response) => {}
)

export { createPostLike, deletePostLike, createCommentLike, deleteCommentLike }
