import express from "express";
const app = express();
const port = 3000;
app.get("/", (_, res) => {
    res.json({
        message: "this is an example response",
        error: "no errors found so far",
    });
});
app.listen(() => {
    console.log(`Server is listening on http://localhost:${port}`);
});
