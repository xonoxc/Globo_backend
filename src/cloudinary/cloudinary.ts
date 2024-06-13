import { DeleteApiResponse, UploadApiResponse, v2 as cloud } from "cloudinary"
import { configCredentials } from "./config"

class Cloudinary {
     constructor() {
          cloud.config({
               cloud_name: configCredentials.cloud_name,
               api_key: configCredentials.api_key,
               api_secret: configCredentials.api_secret,
               secure: configCredentials.secure,
          })
     }

     async uploadFile(
          fileLocalPath: string
     ): Promise<null | UploadApiResponse> {
          try {
               if (!fileLocalPath) return null

               const result = cloud.uploader.upload(fileLocalPath, {
                    resource_type: "image",
                    folder: "globo-assets",
               })
               return result
          } catch (error: unknown) {
               throw error
          }
     }

     async deleteFile(publicUrl: string): Promise<null | DeleteApiResponse> {
          try {
               if (!publicUrl) return null

               const result = cloud.uploader.destroy(publicUrl, {
                    resource_type: "image",
               })
               return result
          } catch (error: unknown) {
               throw error
          }
     }
}

const cloudinary = new Cloudinary()

export default cloudinary
