import { ApiError, ApiResponse, asyncHandler, uuidSchema } from "../utils"
import { ApiRequest } from "../types/ApiRequest"
import { cache } from "../caching/redis"
import { Response } from "express"
import { createConnectionValidationSchema } from "../utils/validation/connection"
import { prisma } from "../lib/prisma.client"

const toggleConnection = asyncHandler(
	async (req: ApiRequest, res: Response) => {
		const { followingId, followerId } = req.body

		if (followerId === followingId)
			throw new ApiError("follower and following id cannot be same.", 400)

		const validationResult = createConnectionValidationSchema.safeParse({
			followingId,
			followerId,
		})

		if (!validationResult.success) {
			throw new ApiError("Invalid payload provided!", 400, [
				{ ...validationResult.error, name: "validation error" },
			])
		}

		const parsedPayload = validationResult.data

		const resultTantConnection = await prisma.$transaction(
			async prisma => {
				const existingConnection =
					await prisma.connection.findFirst({
						where: {
							AND: [
								{
									followerId:
										parsedPayload.followerId,
								},
								{
									followingId:
										parsedPayload.followingId,
								},
							],
						},
					})

				if (existingConnection) {
					return await prisma.connection.delete({
						where: {
							id: existingConnection.id,
						},
					})
				}

				return await prisma.connection.create({
					data: {
						followerId: parsedPayload.followerId,
						followingId: parsedPayload.followingId,
					},
				})
			}
		)

		if (!resultTantConnection)
			throw new ApiError("Cannot create connection!", 500)

		await cache.deleteValue(`following:${parsedPayload.followerId}`)
		await cache.deleteValue(`followers:${parsedPayload.followingId}`)

		return res
			.status(201)
			.json(
				new ApiResponse(201, "connection toggled successfully!", {})
			)
	}
)

const getUserFollowers = asyncHandler(
	async (req: ApiRequest, res: Response) => {
		const { userId } = req.params

		const validationResult = uuidSchema.safeParse(userId)
		if (!validationResult.success) {
			throw new ApiError("Invalid userId provided!", 400, [
				{ ...validationResult.error, name: "validation error" },
			])
		}

		const cachekey = `followers:${userId}`
		const followers = await cache.getValue(cachekey)
		if (followers) {
			return res
				.status(200)
				.json(
					new ApiResponse(
						200,
						"followers fetched successfully!",
						followers
					)
				)
		}

		const result = await prisma.connection.findMany({
			where: {
				followingId: userId,
			},
			select: {
				followerId: true,
			},
		})

		if (!result)
			return res
				.status(404)
				.json(new ApiResponse(500, "Error fetching followers", {}))

		await cache.setValue(cachekey, result)

		return res.status(200).json(
			new ApiResponse(200, "followers fetched successfully!", {
				followers: result,
			})
		)
	}
)

const getUserFollowing = asyncHandler(
	async (req: ApiRequest, res: Response) => {
		const { userId } = req.params

		const validationResult = uuidSchema.safeParse(userId)
		if (!validationResult.success) {
			throw new ApiError("Invalid userId provided!", 400, [
				{ ...validationResult.error, name: "validation error" },
			])
		}

		const cachekey = `following:${userId}`
		const following = await cache.getValue(cachekey)
		if (following) {
			return res

				.status(200)
				.json(
					new ApiResponse(
						200,
						"following fetched successfully!",
						following
					)
				)
		}

		const result = await prisma.connection.findMany({
			where: {
				followerId: userId,
			},
			select: {
				followingId: true,
			},
		})

		if (!result)
			return res
				.status(404)
				.json(new ApiResponse(500, "Error fetching following", {}))

		await cache.setValue(cachekey, result)

		return res.status(200).json(
			new ApiResponse(200, "following fetched successfully!", {
				following: result,
			})
		)
	}
)


export { toggleConnection, getUserFollowers, getUserFollowing }

