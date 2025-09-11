import express from "express";
import cors from "cors";
import dashboardRouter from "./routes/DashboardRoute.js";
import authRouter from "./routes/AuthRouter.js";
import settingRouter from "./routes/SettingsRoute.js"
import profileRouter from "./routes/ProfileRoute.js"
import leaderboardRouter from "./routes/LeaderboardRoute.js"

const app = express();

app.use(cors());
app.use(express.json());

// Calls the auth router
app.use('/auth', authRouter);

// Calls the dashboard router
app.use('/dashboard', dashboardRouter);

// Call Leaderboard router
app.use('/leaderboard', leaderboardRouter)

// Call Profile router
app.use('/profile', profileRouter);

// Calls settings router
app.use('/settings', settingRouter)


export default app;