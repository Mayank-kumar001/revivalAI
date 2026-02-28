import express from "express"
import "dotenv/config"

const app = express();
const port = process.env.PORT

app.get('/', (req, res) => {
    res.send('Hello World!')
})


// importing routes
import {healthCheckRouter} from "./routers/healthCheck.router.js";
import { videoProcessingRouter } from "./routers/videoProcessing.router.js";
app.use("/api/v1/healthCheck", healthCheckRouter);  
app.use("/api/v1/process", videoProcessingRouter);  

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});