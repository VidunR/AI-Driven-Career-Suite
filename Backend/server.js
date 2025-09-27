import app from "./app.js";
import dotenv from "dotenv";
import interviewResultRoute from "./routes/InterviewResultRoute.js";

//app.use('/cvbuilder', CvBuilderRoute);
//app.use('/cvmanager', CVManagerRoute);

//app.use("/interviewresult", interviewResultRoute);

dotenv.config();

const PORT = process.env.BACKEND_SERVER_PORT || process.env.BACKEND_BACKUP_SERVER_PORT

app.listen(PORT, () => {
    console.log(`The server starts running in PORT ${PORT}`);
});