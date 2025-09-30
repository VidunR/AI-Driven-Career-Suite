import prisma from "../config/db.js";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import axios from "axios";


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

export const getJobsWithoutExtract = async (req, res) => {
  let { jobTitle, country } = req.body;

    const COUNTRY_ALIASES = {
    "us": "United States", "usa": "United States", "u.s.": "United States", "u.s.a": "United States",
    "united states of america": "United States",
    "uk": "United Kingdom", "u.k.": "United Kingdom", "england": "United Kingdom",
    "scotland": "United Kingdom", "wales": "United Kingdom", "northern ireland": "United Kingdom",
    "uae": "United Arab Emirates",
    "sl": "Sri Lanka", "lka": "Sri Lanka",
    "south korea": "Korea, Republic of",
    "north korea": "Korea, Democratic People's Republic of",
  };

  const ROLE_SYNONYMS = {
    "Software Engineer": [
      "software engineer","software developer","programmer","developer",
      "software dev","sw engineer","se","swe","sde","sd1","sd2",
      "senior software engineer","full stack developer","backend developer","frontend developer"
    ],
    "Cybersecurity Specialist": [
      "cybersecurity specialist","cyber security specialist","security engineer",
      "information security analyst","infosec analyst","soc analyst","security analyst",
      "application security engineer","appsec","security operations"
    ],
    "Accountant": [
      "accountant","accounts executive","senior accountant","staff accountant",
      "financial accountant","general ledger accountant","gl accountant"
    ],
    "Project Manager": [
      "project manager","pm","technical project manager","it project manager",
      "program manager","delivery manager","scrum master"
    ],
    "Digital Marketer": [
      "digital marketer","digital marketing specialist","performance marketer",
      "seo specialist","sem specialist","social media marketer","growth marketer",
      "ppc specialist"
    ],
  };

  const normalizeCountry = (input = "") => {
    const key = String(input).toLowerCase().trim();
    return COUNTRY_ALIASES[key] || key;
  }

  const normalizeRole = (input = "") => {
    const key = String(input).toLowerCase().trim();
    for (const [canonical, synonyms] of Object.entries(ROLE_SYNONYMS)) {
      if (synonyms.some(s => s.toLowerCase() === key)) {
        return canonical;
      }
    }
    return input;
  };

  try {
    jobTitle = normalizeRole(jobTitle);
    country  = normalizeCountry(country);

    const results = await axios.post(
      "https://api.apijobs.dev/v1/job/search",
      {
        q: jobTitle,
        country: country, 
      },
      {
        headers: {
          apikey: process.env.API_JOB_DEV,
          "Content-Type": "application/json"
        }
      }
    );

    const sendData = {
      "keywords": {
        "from": 0,
        "size": 50,
        "q": jobTitle
      },
      "jobs": results.data.hits
    }

    return res.status(200).json(sendData);
  } catch (err) {
    console.error(
      "APIJobDev error:",
      err.response?.status,
      err.response?.data || err.message
    );
    return res.status(500).json({
      errorMessage: `An error occurred: ${err.response?.data?.message || err.message}`
    });
  }
};

