import fs from "fs"
import { DeleteApiResponse, UploadApiResponse, v2 as cloud } from "cloudinary"
import { configCredentials } from "./config"
import { extractPublicId } from "cloudinary-build-url"
import { env } from "../utils/validation/env.validation"

class Cloudinary {
	private folderName: string

	constructor() {
		cloud.config({
			cloud_name: configCredentials.cloud_name,
			api_key: configCredentials.api_key,
			api_secret: configCredentials.api_secret,
			secure: configCredentials.secure,
		})
		this.folderName =
			env.NODE_ENV === "development" ?
				env.CLOUDINARY_DEV_FOLDER : "globo-assets"
	}

	async uploadFile(fileLocalPath: string): Promise<null | string> {
		try {
			if (!fileLocalPath) return null

			const result: UploadApiResponse = await cloud.uploader.upload(
				fileLocalPath,
				{
					resource_type: "image",
					folder: this.folderName,
				}
			)

			fs.unlinkSync(fileLocalPath)

			return result.secure_url
		} catch (error: unknown) {
			fs.unlinkSync(fileLocalPath)

			return null
		}
	}

	async uploadMultiple(files: string[]): Promise<null | string[]> {
		try {
			let uploadResponse: string[] = []
			if (!files || files.length == 0) {
				return null
			}

			for await (const image of files) {
				const response: UploadApiResponse =
					await cloud.uploader.upload(image, {
						resource_type: "image",
						folder: this.folderName,
					})
				fs.unlinkSync(image)

				uploadResponse.push(response.secure_url)
			}

			return uploadResponse
		} catch (error) {
			throw new Error(`[Cloudinary upload error]: ${error}`)
		}
	}

	async deleteFile(url: string): Promise<null | DeleteApiResponse> {
		try {
			const publicId = extractPublicId(url)

			if (!publicId) return null

			const result = await cloud.uploader.destroy(publicId, {
				resource_type: "image",
			})
			return result
		} catch (error: unknown) {
			throw new Error(`[Cloudinary delete error]: ${error}`)
		}
	}
}

const cloudinary = new Cloudinary()

export default cloudinary
