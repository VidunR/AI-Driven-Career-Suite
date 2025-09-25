import prisma from "../config/db.js";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";


// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_BIN = process.env.PYTHON_BIN || "python";
const PY_TIMEOUT_MS = parseInt(process.env.PY_TIMEOUT_MS || "120000", 10);

// Get all the available CVs
export const getJobSearchCVs = async(req, res) => {
    const userID = req.user.userId;

    try{
        const cvResults = await prisma.cv.findMany({
            where: {userId: parseInt(userID)},
            select: {
                cvId: true,
                cvName: true,
                cvFilepath: true,
                userId: true
            }
        });

        if(!cvResults){
            return res.status(404).json({message: "No CV Available"});
        }

        return res.status(200).json(cvResults);
    }
    catch(err){
        return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
    }
}

// Scan the selected CV

export const extractSelectedCVJobs = async (req, res) => {
  const { cvId: cvID } = req.body;

  if (!cvID) {
    return res.status(400).json({ message: "cvId is required" });
  }

  try {
    const cv = await prisma.cv.findUnique({
      where: { cvId: parseInt(cvID) },
      select: { cvFilepath: true },
    });

    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Resolve absolute CV path safely
    const cvPath = path.resolve(process.cwd(), cv.cvFilepath);

    if (!fs.existsSync(cvPath)) {
      return res.status(404).json({ message: `CV file not found on disk: ${cvPath}` });
    }

    // Resolve the Python script path
    const scriptPath = path.join(__dirname, "..", "job_matching_algorithm", "Job_Matching.py");
    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({ error: `Python script not found at ${scriptPath}` });
    }

    // Spawn Python
    // Use cwd so any relative imports/paths inside the python script behave
    const py = spawn(PYTHON_BIN, [scriptPath, cvPath], {
      cwd: path.dirname(scriptPath),
      env: {
        ...process.env,
      },
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    // Optional timeout
    const timer = setTimeout(() => {
      timedOut = true;
      try { py.kill("SIGKILL"); } catch {}
    }, PY_TIMEOUT_MS);

    py.stdout.on("data", (chunk) => (stdout += chunk.toString("utf8")));
    py.stderr.on("data", (chunk) => (stderr += chunk.toString("utf8")));

    py.on("error", (err) => {
      clearTimeout(timer);
      return res.status(500).json({ error: `Failed to start Python: ${err.message}` });
    });

    py.on("close", (code) => {
      clearTimeout(timer);

      if (timedOut) {
        return res.status(504).json({ error: "Python process timed out" });
      }

      if (code !== 0) {
        return res.status(500).json({
          error: `Python exited with code ${code}`,
          stderr,
        });
      }
      
      try {
        const data = JSON.parse(stdout);
        return res.status(200).json({
            keywords: data.search_params,
            jobs: data.jobs.hits});
      } catch {
        try {
          const start = stdout.lastIndexOf("{");
          const end = stdout.lastIndexOf("}");
          if (start !== -1 && end !== -1 && end > start) {
            const maybe = stdout.slice(start, end + 1);
            const data = JSON.parse(maybe);
            return res.status(200).json(data);
          }
        } catch {}
        return res.status(500).json({
          error: "Invalid Python JSON response",
          stderr,
          stdoutPreview: stdout.slice(0, 5000),
        });
      }
    });
  } catch (err) {
    console.error("extractSelectedCVJobs error:", err);
    return res.status(500).json({ errorMessage: `An error occurred: ${err.message || err}` });
  }
};

// Get Jobs using Keyword Search

/*export const getJobsWithoutExtract = async (req, res) => {
  const { jobTitle, country } = req.body;

  try {
    const response = await axios.get("https://api.apijobs.dev/v1/job/search", {
      headers: {
        "apikey": process.env.API_JOB_DEV,
      },
      params: {
        country: country,
        q: jobTitle
      }
    });

    return res.status(200).json(response.data);

  } catch (err) {
    console.error("APIJobDev error:", err.message || err);
    return res
      .status(500)
      .json({ errorMessage: `An error occurred: ${err.message || err}` });
  }
};*/

