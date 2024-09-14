import { RedisClientOptions, createClient } from "redis"
import options from "./config"
import chalk from "chalk"

class CacheService {
     private client: ReturnType<typeof createClient>
     private isConnected = false

     constructor(clientOptions: RedisClientOptions) {
          this.client = createClient(clientOptions)
     }

     /* Initializing the redis connection */

     public async initConnection(): Promise<void> {
          try {
               await this.client.connect()

               this.initListenters()

               this.isConnected = true

               console.log(chalk.cyanBright("  Redis client connected"))
          } catch (error) {
               console.error(`Redis connection failed! ${error}`)
               throw new Error("Redis connection failure!")
          }
     }

     /* Initializing the Event Listenters */
     public initListenters(): void {
          this.client.on("ready", (): void => {
               console.log("Redis client is ready to use!")
          })

          this.client.on("error", (err): void => {
               console.log(`Redis client Error : ${err}`)
          })

          this.client.on("end", (): void =>
               console.log("redis client disconnected!")
          )
     }

     public async setValue(key: string, value: object): Promise<boolean> {
          try {
               const response = await this.client.set(
                    key,
                    JSON.stringify(value)
               )

               if (response === "OK") return true
               return false
          } catch (error: any) {
               console.error(`Error while setting the cache : ${error.message}`)
               return false
          }
     }

     public async getValue(key: string): Promise<object | null> {
          try {
               const response = await this.client.get(key)
               if (response) {
                    return JSON.parse(response)
               }
               return null
          } catch (error) {
               return null
          }
     }

     public async deleteValue(key: string): Promise<void> {
          try {
               await this.client.del(key)
          } catch (error) {
               throw new Error(`Error while deleting cache value : ${error}`)
          }
     }

     /*  SHUTDOWN CASE */

     public async closeConnection(): Promise<void> {
          try {
               if (this.isConnected) {
                    await this.client.quit()
                    this.isConnected = false
               } else {
                    console.log("Redis client is already closed")
               }
          } catch (error) {
               console.error("Error while closing redis connection:", error)
          }
     }
}

export const cache = new CacheService(options)
