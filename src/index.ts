import chalk from "chalk"
import app from "./app/app"
import { cache } from "./caching/redis"
import { env } from "./utils/validation/env.validation"
import { initShutdownConfig } from "./utils"

/* Server initialization  */

async function initServer(): Promise<void> {
     try {
          await cache.initConnection()
          const server = app.listen(env.PORT, (): void => {
               console.log(
                    chalk.grey(`󰒋 Server is listening on port : ${env.PORT}`)
               )
          })

          initShutdownConfig(server)
     } catch (err) {
          console.error("Failed to initialize server :", err)
          process.exit(1)
     }
}

app.on("error", (error): void => {
     console.error("Application Error:", error)
     throw error
})

initServer()
