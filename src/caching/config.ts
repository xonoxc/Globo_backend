import { RedisClientOptions } from "redis"
import { env } from "../utils/validation/env.validation"

const options: RedisClientOptions = {
     username: env.REDIS_USERNAME,
     password: env.REDIS_PASSWORD,
     socket: {
          host: env.REDIS_HOST,
          port: Number(env.REDIS_PORT),
          reconnectStrategy: (retries) => {
               if (retries > 20) {
                    console.log(
                         "Too many attempts to reconnect . Redis Connection was terminated"
                    )
                    return new Error("[Redis Connection]:Too many retries!")
               } else {
                    return retries * 500
               }
          },
          connectTimeout: 10000,
     },
}

export default options
