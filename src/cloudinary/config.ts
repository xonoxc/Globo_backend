interface ConfigCloundinary {
	cloud_name: string
	api_key: string
	api_secret: string
	secure: boolean
}

export const configCredentials: ConfigCloundinary = {
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
	api_key: process.env.CLOUDINARY_API_KEY as string,
	api_secret: process.env.CLOUDINARY_API_SECRET as string,
	secure: true,
}
