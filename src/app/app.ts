import express, { Express } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { env } from "../utils/validation/env.validation"
import morgan from "morgan"
import logger from "../middlewares/logger.middleware"

const app: Express = express()

const morganFormat = ":method :url :status :response-time ms"

/* middlewares */

app.use(
     cors({
          origin: env.CLIENT_URL,
          credentials: true,
     })
)

app.use(
     express.json({
          limit: "60kb",
     })
)

app.use(
     express.urlencoded({
          extended: true,
          limit: "60kb",
     })
)

app.use(express.static("public"))
app.use(cookieParser())

app.use(
     morgan(morganFormat, {
          stream: {
               write: (message: string) => {
                    const messageChunks = message.split("")
                    const logObject = {
                         method: messageChunks[0],
                         url: messageChunks[1],
                         status: messageChunks[2],
                         responseTime: messageChunks[3],
                    }
                    logger.info(JSON.stringify(logObject))
               },
          },
     })
)

/* router imports  && injection */

export default app
