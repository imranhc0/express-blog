const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config()

const rootRouter = require("./routes/index")
const connectDB = require("./config/db")

const PORT = process.env.PORT || 3000
const app = express()

connectDB()
app.use(express.json())
app.use(cors())
app.use("/api/v1", rootRouter);


app.listen(PORT,()=> {
    console.log(`Running on ${PORT}`)
})


