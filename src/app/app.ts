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
               write: (message) => {
                    const [method, url, status, responseTime] = message
                         .trim()
                         .split(" ")

                    const logObject = {
                         method,
                         url,
                         status: parseInt(status, 10),
                         responseTime: responseTime.replace("ms", ""),
                    }

                    logger.info(JSON.stringify(logObject))
               },
          },
          skip: () => {
               const environment = process.env.NODE_ENV || "development"
               return environment !== "development"
          },
     })
)

/* router imports  && injection */

import userRouter from "../routes/user.routes"
import healthCheckRouter from "../routes/healthCheck.route"

app.use("/api/v1/usr", userRouter)
app.use("/api/v1", healthCheckRouter)

export default app
