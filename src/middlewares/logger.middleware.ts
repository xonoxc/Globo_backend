import { createLogger, format, transports } from "winston"

const { combine, colorize, printf, timestamp, json } = format

const consoleLogFormat = printf(({ level, message, timestamp }): string => {
     return `${timestamp} ${level}: ${message}`
})

const logger = createLogger({
     level: "info",
     format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
     transports: [
          new transports.Console({
               format: combine(colorize(), consoleLogFormat),
          }),
          new transports.File({
               filename: "./logs/app.log",
               level: "error",
               format: consoleLogFormat,
          }),
     ],
})

export default logger
