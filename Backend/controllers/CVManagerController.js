import prisma from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all the Cvs
export const getCVs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const list = await prisma.cv.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { modifiedDate: "desc" },
    });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ errorMessage: `Error getting CVs: ${err}` });
  }
};

// SHow the selected CV
export const getCVDetails = async (req, res) => {
  const cvID = req.params.cvID;

  try {
    const cvResults = await prisma.cv.findUnique({
      where: {cvId: parseInt(cvID)},
      select: {
        cvName: true,
        cvFilepath: true,
      }
    });

    if (!cvResults || cvResults.length === 0) {
      return res.status(404).send("CV not found");
    }

    return res.status(200).json(cvResults);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching CV");
  }
}


// Post: UploadCVs
export const uploadCV = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const relPath = `assets/CVs/${req.file.filename}`;
    const cvName = req.body.cvName || req.file.originalname;

    const row = await prisma.cv.create({
      data: {
        userId: parseInt(userId),
        cvFilepath: relPath,
        cvImagePath: "",
        cvName,
        modifiedDate: new Date(),
      },
    });

    return res.status(201).json(row);
  } catch (err) {
    return res.status(500).json({ errorMessage: `Upload failed: ${err}` });
  }
};


// Delete the CV

export const deleteCV = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cvId = parseInt(req.params.cvID);

    const existing = await prisma.cv.findFirst({
      where: { cvId, userId: parseInt(userId) },
    });
    if (!existing) return res.status(404).json({ message: "Not found" });

    // attempt to delete the file as well (ignore errors)
    if (existing.cvFilepath?.startsWith("/uploads/")) {
      const fileAbs = path.join(process.cwd(), existing.cvFilepath);
      fs.promises.unlink(fileAbs).catch(() => {});
    }

    await prisma.cv.delete({ where: { cvId } });
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ errorMessage: `Delete failed: ${err}` });
  }
};