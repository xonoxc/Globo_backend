import express, { Express } from "express"

const app: Express = express()

const port: number = 3000

app.get("/", (_, res) => {
     res.json({
          message: "this is an example response",
          error: "no errors found so far",
     })
})

app.listen(() => {
     console.log(`Server is listening on http://localhost:${port}`)
})
