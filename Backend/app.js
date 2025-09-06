import express from "express";
import cors from "cors";
import userRouter from "./routes/UserRoute.js";

const app = express();

app.use(cors());
app.use(express.json());

// Calls the user router
app.use('/user', userRouter);

export default app;