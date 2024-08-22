import { RedisClientOptions } from "redis"
import { env } from "../utils/validation/env.validation"

const options: RedisClientOptions = {
     username: env.REDIS_USERNAME || "",
     password: env.REDIS_PASSWORD || "",
     socket: {
          host: env.REDIS_HOST || "localhost",
          port: Number(env.REDIS_PORT) || 6379,
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

const ProdOptions: RedisClientOptions = {
     url: env.REDIS_URL,
     socket: {
          host: env.REDIS_HOST || "localhost",
          port: Number(env.REDIS_PORT) || 6379,
          reconnectStrategy: (retries) => {
               if (retries > 20) {
                    console.error(
                         "Too many attempts to reconnect. Redis Connection was terminated"
                    )
                    return new Error("[Redis Connection]: Too many retries!")
               } else {
                    return retries * 500
               }
          },
          connectTimeout: 100000,
     },
}

export default env.NODE_ENV == "development" ? options : ProdOptions
