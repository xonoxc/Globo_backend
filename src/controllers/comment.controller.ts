import { ApiRequest } from "../types/ApiRequest"
import { asyncHandler } from "../utils"

const createComment = asyncHandler(async (req: ApiRequest, res: Response) => {})

const createCommentReply = asyncHandler(
     async (req: ApiRequest, res: Response) => {}
)

const updateComment = asyncHandler(async (req: ApiRequest, res: Response) => {})

const deleteComment = asyncHandler(async (req: ApiRequest, res: Response) => {})

export { createComment, deleteComment, updateComment, createCommentReply }
