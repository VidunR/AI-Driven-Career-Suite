import express from "express";
import cors from "cors";
import userRouter from "./routes/UserRoute.js";
import projectRouter from "./routes/ProjectRoute.js"

const app = express();

app.use(cors());
app.use(express.json());

// Calls the user router
app.use('/user', userRouter);

// Calls the project router
app.use('/project', projectRouter);

export default app;