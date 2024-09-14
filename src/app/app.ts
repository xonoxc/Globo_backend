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
               write: (message): void => {
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
          skip: (): boolean => {
               const environment = process.env.NODE_ENV || "development"
               return environment !== "development"
          },
     })
)

/* router imports  && injection */

const apiRouter = express.Router()

import userRouter from "../routes/user.routes"
import healthCheckRouter from "../routes/healthCheck.route"
import postRouter from "../routes/post.routes"
import paymentRouter from "../routes/payment.route"
import completionRouter from "../routes/completion.routes"
import commentRouter from "../routes/comment.routes"
import bookmarkRouter from "../routes/bookmark.routes"
import connectionRouter from "../routes/connect.routes"
import likeRouter from "../routes/likes.routes"

apiRouter.use("/usr", userRouter)
apiRouter.use("/hc", healthCheckRouter)
apiRouter.use("/p", postRouter)
apiRouter.use("/s", paymentRouter)
apiRouter.use("/ai", completionRouter)
apiRouter.use("/comments", commentRouter)
apiRouter.use("/bookmarks", bookmarkRouter)
apiRouter.use("/likes", likeRouter)
apiRouter.use("/connections", connectionRouter)

app.use("/api/v1", apiRouter)

export default app
