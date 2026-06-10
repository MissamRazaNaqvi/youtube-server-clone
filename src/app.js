import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// use for cross origin rule
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
// use for form data 
app.use(express.json());
// use for url query data
app.use(express.urlencoded())
// use cookie crud operations 
app.use(cookieParser())

app.use(express.static('public'))


// routes

import { userRouter } from "./routes/users.route.js";

// routes declaration

app.use("/api/v1/users/",userRouter)

export  {app}