import { createLogger, format, transports } from "winston"

const { combine, colorize, json, timestamp } = format

const consoleLogFormat = format.combine(
     format.colorize(),
     format.printf(({ level, message, timestamp }) => {
          return `${level}:: ${message} :: ${timestamp}`
     })
)

const logger = createLogger({
     level: "info",
     format: combine(colorize(), timestamp(), json()),
     transports: [
          new transports.Console({
               format: consoleLogFormat,
          }),
          new transports.File({
               filename: "../../logs/app.log",
          }),
     ],
})

export default logger
