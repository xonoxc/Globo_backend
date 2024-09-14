import { Server, IncomingMessage, ServerResponse } from "http"
import { cache } from "../../caching/redis"

type AppInstance = Server<typeof IncomingMessage, typeof ServerResponse>

export const initShutdownConfig = (app: AppInstance): void => {
     let isShuttingDown = false

     const shutdown = async (): Promise<void> => {
          if (isShuttingDown) return

          isShuttingDown = true

          app.close(err => {
               if (err) {
                    console.error("Error while closing server:", err)
               }

               console.log("Server closed...")
          })

          await cache.closeConnection()

          process.exit(0)
     }

     process.on("SIGTERM", shutdown)
     process.on("SIGINT", shutdown)
}
