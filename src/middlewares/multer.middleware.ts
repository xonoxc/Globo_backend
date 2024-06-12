import multer, { diskStorage } from "multer"


const storage = diskStorage({
	destination: (_, __, cb) => {
		cb(null, "../../public/temp/")
	},
	filename: (_, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		cb(null, file.originalname + '-' + uniqueSuffix)
	}
})

export const upload = multer({ storage })

