import Groq from "groq-sdk"
import { env } from "../utils/validation/env.validation"
import { ApiError, asyncHandler } from "../utils"
import { ApiRequest } from "../types/ApiRequest"
import { cache } from "../caching/redis"
import { Response } from "express"
import { Readable } from "stream"

const groq = new Groq({ apiKey: env.AI_API_KEY })

const getCompletion = asyncHandler(async (req: ApiRequest, res: Response) => {
	const { content, retry }: { content: string; retry: boolean } = req.body

	if (!content || content.trim() === "") {
		throw new ApiError("Invalid data ... content not provided!", 400)
	}

	const key = `summery:${content}`

	if (retry) {
		await cache.deleteValue(key)
	}

	let cachedResponse = (await cache.getValue(key)) as {
		resCache: string
	}
	if (cachedResponse && cachedResponse.resCache) {
		const stream = Readable.from(cachedResponse.resCache)
		return stream.pipe(res)
	}

	const aiResponse = await getGroqCompletion(content)

	const responseContent = aiResponse.choices[0]?.message?.content || ""

	await cache.setValue(key, { resCache: responseContent })

	const stream = Readable.from(responseContent)
	return stream.pipe(res)
})

const getGroqCompletion = async (content: string) => {
	const prompt = `
Summarize the data in this piece of text and give back the most important points in the form of an array. Each element should be a point about what is written in the paragraph. Make sure the output is in a valid JavaScript array format.
This is the content: "${content} and make sure that you just give me the array as response nothing else just start from [ and end with ]."
`

	return groq.chat.completions.create({
		messages: [
			{
				role: "user",
				content: prompt,
			},
		],
		model: "llama3-8b-8192",
	})
}

export { getCompletion }
