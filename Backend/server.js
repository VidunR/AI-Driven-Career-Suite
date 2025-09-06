import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.BACKEND_SERVER_PORT || process.env.BACKEND_BACKUP_SERVER_PORT

app.listen(PORT, () => {
    console.log(`The server starts running in PORT ${PORT}`);
});