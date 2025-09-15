import express from "express";
import cors from "cors";
import dashboardRouter from "./routes/DashboardRoute.js";
import authRouter from "./routes/AuthRouter.js";
import settingRouter from "./routes/SettingsRoute.js"
import profileRouter from "./routes/ProfileRoute.js"
import leaderboardRouter from "./routes/LeaderboardRoute.js"
import interviewhistoryRouter from "./routes/InterviewHistoryRoute.js"
import interviewresultsRouter from "./routes/InterviewResultRoute.js"
import interviewRouter from './routes/InterviewRoute.js'
import cvbuilderRouter from './routes/CvBuilderRoute.js'
import cvmanagerRouter from './routes/CVManagerRoute.js'

const app = express();

app.use(cors());
app.use(express.json());

// Calls the auth router
app.use('/auth', authRouter);

// Calls the dashboard router
app.use('/dashboard', dashboardRouter);

// Call the CV Builder
app.use('/cvbuilder', cvbuilderRouter);

// Call the CV Manager
app.use('/cvmanager', cvmanagerRouter);

// Call Leaderboard router
app.use('/leaderboard', leaderboardRouter);

// Call Interview router
app.use('/interview', interviewRouter);

// Call Interview History
app.use('/interviewhistory', interviewhistoryRouter);

// Call Interview Results
app.use('/interviewresults', interviewresultsRouter);

// Call Profile router
app.use('/profile', profileRouter);

// Calls settings router
app.use('/settings', settingRouter);


export default app;