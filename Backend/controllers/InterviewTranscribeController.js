// Backend/controllers/InterviewTranscribeController.js
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PYTHON_EXEC = process.env.PYTHON_EXEC || "python";
const scriptPath  = path.resolve(__dirname, "..", "mock-interview-algorithms", "transcribe_whisper.py");
const scriptCwd   = path.dirname(scriptPath);

// map common audio MIME types to extensions
function mimeToExt(m) {
  const map = {
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/opus": ".opus",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/wave": ".wav",
    "audio/mp4": ".mp4",
    "audio/x-m4a": ".m4a",
    "audio/aac": ".aac",
    "video/mp4": ".mp4",
  };
  return map[(m || "").toLowerCase()] || "";
}

export const sendTransible = async (req, res) => {
  try {
    const scriptOk = fs.existsSync(scriptPath);
    const cwdOk    = fs.existsSync(scriptCwd);
    console.log("[/interview/transcribe] PYTHON_EXEC:", PYTHON_EXEC);
    console.log("[/interview/transcribe] scriptPath:", scriptPath, "exists?", scriptOk);
    console.log("[/interview/transcribe] scriptCwd :", scriptCwd, "exists?", cwdOk);

    if (!scriptOk || !cwdOk) {
      return res.status(500).json({
        error: "script_not_found",
        detail: `Missing script or working dir. scriptPath=${scriptPath} (exists=${scriptOk}), cwd=${scriptCwd} (exists=${cwdOk})`,
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "no_file", detail: "audio file is required" });
    }

    const language = req.body?.language || "en";

    // --- ensure uploaded file has an extension ---
    let uploadPath = path.resolve(req.file.path);
    let ext = path.extname(uploadPath);
    if (!ext) {
      // try originalname first, then mimetype
      ext = path.extname(req.file.originalname || "") || mimeToExt(req.file.mimetype) || ".webm";
      const newPath = `${uploadPath}${ext}`;
      try {
        fs.renameSync(uploadPath, newPath);
        uploadPath = newPath;
        console.log("[/interview/transcribe] renamed file to:", uploadPath);
      } catch (e) {
        console.warn("[/interview/transcribe] rename failed, continuing with original path:", e);
      }
    }

    // normalize path for Python on Windows
    const audioForPy = process.platform === "win32" ? uploadPath.replace(/\\/g, "/") : uploadPath;

    // spawn python WITHOUT shell (prevents space-in-path issues)
    const py = spawn(PYTHON_EXEC, [scriptPath], {
      cwd: scriptCwd,
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
    });

    let out = "";
    let err = "";

    py.stdout.on("data", (d) => (out += d.toString()));
    py.stderr.on("data", (d) => (err += d.toString()));

    py.on("error", (e) => {
      console.error("[/interview/transcribe] spawn error:", e);
      try { fs.unlinkSync(uploadPath); } catch {}
      return res.status(500).json({ error: "spawn_failed", detail: String(e) });
    });

    py.on("close", (code) => {
      // cleanup
      try { fs.unlinkSync(uploadPath); } catch {}

      if (code !== 0 && !out) {
        console.error("[/interview/transcribe] python exit nonzero:", code, "stderr:", err);
        return res.status(500).json({ error: "python_exit_nonzero", code, stderr: err });
      }

      try {
        const json = JSON.parse(out);
        if (json.error) {
          console.error("[/interview/transcribe] python returned error json:", json, "stderr:", err);
          return res.status(502).json({ ...json, stderr: err });
        }
        return res.json(json);
      } catch (e) {
        console.error("[/interview/transcribe] python non-JSON output:", out, "stderr:", err, "parseErr:", e);
        return res.status(502).json({
          error: "non_json_from_python",
          raw: out,
          stderr: err,
          parseError: String(e),
        });
      }
    });

    // send stdin payload to python
    const stdinPayload = { audio_path: audioForPy, language };
    py.stdin.write(JSON.stringify(stdinPayload));
    py.stdin.end();
  } catch (e) {
    console.error("[/interview/transcribe] route exception:", e);
    return res.status(500).json({ error: "route_exception", detail: String(e) });
  }
};