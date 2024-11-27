import mongoose from "mongoose"
import express from "express"
import {userRouter} from "./routes/userRouter";
import {blogRouter} from "./routes/blogRouter";
import {commentRouter} from "./routes/commentRouter";
const app = express()

const url = process.env.MONGODB_URI;
if(!url){
    throw new Error("Missing MongoDB url!");
}
mongoose.connect(url).then((result) => {
    console.log("database connected !!!");
})

app.use(express.json())
app.use(userRouter)
app.use(blogRouter)
app.use(commentRouter)

const PORT = process.env.PORT || 3003;


app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
