import multer, { diskStorage } from "multer"

const storage = diskStorage({
     destination: (_, __, cb) => {
          cb(null, "./public/temp")
     },
     filename: (_, file, cb) => {
          cb(null, file.originalname)
     },
})

export const upload = multer({ storage })
