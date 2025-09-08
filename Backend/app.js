import express from "express";
import cors from "cors";
import dashboardRouter from "./routes/DashboardRoute.js";
import authRouter from "./routes/AuthRouter.js"

const app = express();

app.use(cors());
app.use(express.json());

// Calls the dashboard router
app.use('/dashboard', dashboardRouter);

// Calls the auth router
app.use('/auth', authRouter);

export default app;