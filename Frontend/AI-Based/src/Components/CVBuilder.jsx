import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./UI/card";
import { Button } from "./UI/button";
import { Input } from "./UI/input";
import { Textarea } from "./UI/textarea";
import { Label } from "./UI/label";
import { Badge } from "./UI/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./UI/tabs";
import ResumeAPI from "../api/resumeAPI";
import { CVPreview } from "./CVPreview";
import html2pdf from "html2pdf.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Save,
  Eye,
  Download,
  X,
  Sparkles,
  Wand2,
  Loader2,
} from "lucide-react";

import ThemePicker from "./ThemePicker";
import { resolveTheme, DEFAULT_THEME_ID } from "../themes/cvThemes";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

class AIEnhancementService {
  static async enhanceText(content, type, context = {}) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompts = {
        summary: `
                  Refine the following professional summary into a single polished version (2–3 sentences).
                  Rules:
                  - Preserve the user’s meaning, skills, and experience; do not add facts or metrics.
                  - Do NOT produce multiple options, headings, or explanations.
                  - Return plain text only (no Markdown, no quotes). Return nothing else.
                  Input:
                  ${content}`.trim(),

        experience: `
                    Rewrite the following job description into 3–5 concise, achievement-oriented bullet points.
                    Rules:
                    - Keep facts grounded in the input; do NOT invent employers, products, or metrics.
                    - If the input contains numbers, keep them; otherwise avoid fabricating metrics.
                    - Use action verbs and resume tone.
                    - Output ONLY plain-text bullets (each line starts with "- "), no headings or extra text. Return nothing else.
                    Context: role=${context.jobTitle || ""} company=${context.company || ""}
                    Input:
                    ${content}`.trim(),

        achievement: `
                      Refine the following achievement into 2–3 resume-ready bullet points.
                      Rules:
                      - Preserve the original meaning; do NOT invent details or metrics.
                      - Use action verbs; keep phrasing concise and professional.
                      - Output ONLY plain-text bullets (each line starts with "- "). No headings, options, or explanations. Return nothing else.
                      Input:
                      ${content}`.trim(),

        skills: `
                Suggest 5–8 additional, high-value technical skills relevant to the job title and current skills.
                Rules:
                - Do NOT repeat existing skills.
                - Do NOT add headings or explanations.
                - Return ONLY a single comma-separated list of skill names. Return nothing else.
                Job title: ${context.jobTitle || "professional"}
                Current skills: ${context.currentSkills?.join(", ") || "None"}`.trim(),

        project: `
                  Polish the following project description into 2–3 concise, impact-focused bullet points.
                  Rules:
                  - Keep it grounded in the input; do NOT invent tools, metrics, or outcomes.
                  - Emphasize technical implementation, problems solved, and value.
                  - Output ONLY plain-text bullets (each line starts with "- "). No headings or extra text. Return nothing else.
                  Project: ${context.projectName || ""}
                  Input:
                  ${content}`.trim(),
      };

      const prompt =
        prompts[type] ||
                        `
                        Enhance the following text to sound professional and concise.
                        Rules:
                        - Preserve meaning; do NOT invent facts or metrics.
                        - Return a single polished version in plain text only (no Markdown, no headings). Return nothing else.
                        Input:
                        ${content}`.trim();

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      throw new Error("Failed to enhance content. Please try again.");
    }
  }

  static async generateContent(type, context = {}) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompts = {
        summary: `
                  Write a professional summary (2–3 sentences) for a ${context.jobTitle || "professional"} with ${context.experience || "2–3"} years of experience.
                  Rules:
                  - Emphasize ${context.skills?.join(", ") || "relevant skills"}.
                  - Do NOT invent employers, certifications, or metrics; keep it generic unless provided in context.
                  - Return one plain-text paragraph only (no Markdown, no headings). Return nothing else.`.trim(),

        experience: `
                    Write 3–5 resume bullet points for a ${context.jobTitle || "Software Engineer"} ${context.company ? "at " + context.company : ""}.
                    Rules:
                    - Use action verbs; focus on outcomes and ownership.
                    - Do NOT fabricate metrics; only include numbers if provided in context.metrics.
                    - Output ONLY plain-text bullets (each line starts with "- "), no headings or extra text. Return nothing else.
                    ${context.metrics ? "Metrics to incorporate (if relevant): " + context.metrics : ""}`.trim(),

        achievement: `
                      Write 2–3 concise, impact-oriented resume bullet points for a ${context.jobTitle || "professional"} highlighting a notable achievement.
                      Rules:
                      - Focus on problem, action, and outcome.
                      - Do NOT fabricate details; only include numbers if provided via context.metrics.
                      - Output ONLY plain-text bullets (each line starts with "- "). No headings or extra text. Return nothing else.
                      ${context.metrics ? "Metrics to incorporate (if relevant): " + context.metrics : ""}`.trim(),

        project: `
                  Write a professional project description for "${context.projectName || "a software project"}" in 2–3 concise bullet points.
                  Rules:
                  - Highlight stack/implementation, challenges solved, and value.
                  - Do NOT fabricate metrics or technologies; use only what’s in context.tech or keep generic.
                  - Output ONLY plain-text bullets (each line starts with "- "). No headings or extra text. Return nothing else.
                  ${context.tech ? "Technologies: " + context.tech.join(", ") : ""}`.trim(),
      };

      const prompt =
        prompts[type] ||
                        `
                          Generate concise, professional resume content for "${type}".
                          Rules:
                          - Use action verbs; no invented facts or metrics.
                          - Return plain text only without headings. Return nothing else.`.trim();

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw new Error("Failed to generate content. Please try again.");
    }
  }
}



// AI Enhancement Button Component
function AIEnhanceButton({ onEnhance, isLoading, disabled, size = "sm", variant = "outline" }) {
  return (
    <Button onClick={onEnhance} disabled={disabled || isLoading} size={size} variant={variant} className="gap-2">
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
      {isLoading ? "Enhancing..." : "Enhance with AI"}
    </Button>
  );
}

// PDF Generation Utility 
class CVDownloader {
  static generatePDF(cvData, theme, filename = "resume.pdf") {
    const element = document.createElement("div");
    element.innerHTML = this.generateCVHTML(cvData, theme);

    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: filename,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
    };

    return html2pdf().set(options).from(element).save();
  }

  static generateCVHTML(cvData, theme) {
    const C = theme?.colors || {};
    const { personalInfo, experience, education, skills, achievements, projects } = cvData;

    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: ${C.text};
        line-height: 1.6;
        max-width: 8.5in;
        margin: 0 auto;
        padding: 0.5in;
        background: ${C.paper};
      ">
        <div style="text-align: center; margin-bottom: 2rem; border-bottom: 2px solid ${C.divider}; padding-bottom: 1rem;">
          <h1 style="font-size: 2rem; font-weight: bold; color: ${C.text}; margin: 0 0 0.5rem 0;">
            ${personalInfo.firstName || ""} ${personalInfo.lastName || ""}
          </h1>

          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:1rem;font-size:0.9rem;color:${C.subtleText};margin-bottom:0.5rem;">
            ${personalInfo.email ? `<span>📧 ${personalInfo.email}</span>` : ""}
            ${personalInfo.phone ? `<span>📞 ${personalInfo.phone}</span>` : ""}
            ${personalInfo.location ? `<span>📍 ${personalInfo.location}</span>` : ""}
          </div>

          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:1rem;font-size:0.9rem;color:${C.subtleText};">
            ${personalInfo.linkedin ? `<span>💼 ${personalInfo.linkedin}</span>` : ""}
            ${personalInfo.website ? `<span>🌐 ${personalInfo.website}</span>` : ""}
          </div>
        </div>

        ${
          personalInfo.summary
            ? `
          <div style="margin-bottom: 2rem;">
            <h2 style="font-size:1.25rem;font-weight:600;color:${C.text};margin:0 0 0.75rem 0;border-bottom:1px solid ${C.divider};padding-bottom:0.25rem;">
              Professional Summary
            </h2>
            <p style="color:${C.text};margin:0;text-align:justify;">
              ${personalInfo.summary}
            </p>
          </div>`
            : ""
        }

        ${
          experience && experience.length > 0 && experience[0].jobTitle
            ? `
          <div style="margin-bottom:2rem;">
            <h2 style="font-size:1.25rem;font-weight:600;color:${C.text};margin:0 0 1rem 0;border-bottom:1px solid ${C.divider};padding-bottom:0.25rem;">
              Work Experience
            </h2>
            <div style="display:flex;flex-direction:column;gap:1.5rem;">
              ${experience
                .map((exp) =>
                  exp.jobTitle
                    ? `
                <div style="border-left:3px solid ${C.primary};padding-left:1rem;">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
                    <div style="flex:1;">
                      <h3 style="font-weight:600;color:${C.text};margin:0 0 0.25rem 0;">${exp.jobTitle}</h3>
                      <p style="color:${C.primary};font-weight:500;margin:0 0 0.25rem 0;">${exp.company || ""}</p>
                      ${exp.location ? `<p style="font-size:0.875rem;color:${C.subtleText};margin:0;">${exp.location}</p>` : ""}
                    </div>
                    <div style="font-size:0.875rem;color:${C.subtleText};text-align:right;">
                      📅 ${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}
                    </div>
                  </div>
                  ${
                    exp.description
                      ? `<p style="color:${C.text};font-size:0.875rem;margin:0;text-align:justify;">${exp.description}</p>`
                      : ""
                  }
                </div>`
                    : ""
                )
                .join("")}
            </div>
          </div>`
            : ""
        }

        ${
          education && education.length > 0 && education[0].degree
            ? `
          <div style="margin-bottom:2rem;">
            <h2 style="font-size:1.25rem;font-weight:600;color:${C.text};margin:0 0 1rem 0;border-bottom:1px solid ${C.divider};padding-bottom:0.25rem;">
              Education
            </h2>
            <div style="display:flex;flex-direction:column;gap:1rem;">
              ${education
                .map((edu) =>
                  edu.degree
                    ? `
                <div style="border-left:3px solid ${C.success};padding-left:1rem;">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.25rem;">
                    <div style="flex:1;">
                      <h3 style="font-weight:600;color:${C.text};margin:0 0 0.25rem 0;">${edu.degree}</h3>
                      <p style="color:${C.success};font-weight:500;margin:0 0 0.25rem 0;">${edu.institution || ""}</p>
                      ${edu.location ? `<p style="font-size:0.875rem;color:${C.subtleText};margin:0;">${edu.location}</p>` : ""}
                      ${edu.gpa ? `<p style="font-size:0.875rem;color:${C.subtleText};margin:0;">GPA: ${edu.gpa}</p>` : ""}
                    </div>
                    <div style="font-size:0.875rem;color:${C.subtleText};text-align:right;">📅 ${edu.startDate || ""} - ${
                edu.endDate || ""
              }</div>
                  </div>
                  ${
                    edu.description
                      ? `<p style="color:${C.text};font-size:0.875rem;margin:0;text-align:justify;">${edu.description}</p>`
                      : ""
                  }
                </div>`
                    : ""
                )
                .join("")}
            </div>
          </div>`
            : ""
        }

        ${
          skills && skills.length > 0
            ? `
          <div style="margin-bottom:2rem;">
            <h2 style="font-size:1.25rem;font-weight:600;color:${C.text};margin:0 0 1rem 0;border-bottom:1px solid ${C.divider};padding-bottom:0.25rem;">
              Technical Skills
            </h2>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
              ${skills
                .map(
                  (skill) => `
                <span style="
                  background:${C.chipBg};
                  color:${C.text};
                  padding:0.25rem 0.75rem;
                  border-radius:0.375rem;
                  font-size:0.875rem;
                  border:1px solid ${C.chipBorder};
                ">${skill}</span>`
                )
                .join("")}
            </div>
          </div>`
            : ""
        }

        ${
          projects && projects.length > 0 && projects[0].name
            ? `
          <div style="margin-bottom:2rem;">
            <h2 style="font-size:1.25rem;font-weight:600;color:${C.text};margin:0 0 1rem 0;border-bottom:1px solid ${C.divider};padding-bottom:0.25rem;">
              Projects
            </h2>
            <div style="display:flex;flex-direction:column;gap:1.5rem;">
              ${projects
                .map((project) =>
                  project.name
                    ? `
                <div style="border-left:3px solid ${C.project};padding-left:1rem;">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
                    <div style="flex:1;">
                      <h3 style="font-weight:600;color:${C.text};margin:0 0 0.25rem 0;">${project.name}</h3>
                      ${
                        project.link
                          ? `<p style="color:${C.project};font-size:0.875rem;margin:0 0 0.25rem 0;">🔗 ${project.link}</p>`
                          : ""
                      }
                    </div>
                    ${
                      project.startDate || project.endDate
                        ? `<div style="font-size:0.875rem;color:${C.subtleText};text-align:right;">
                        📅 ${project.startDate || "N/A"} - ${project.current ? "Present" : project.endDate || "N/A"}
                      </div>`
                        : ""
                    }
                  </div>
                  ${
                    project.description
                      ? `<p style="color:${C.text};font-size:0.875rem;margin:0;text-align:justify;">${project.description}</p>`
                      : ""
                  }
                </div>`
                    : ""
                )
                .join("")}
            </div>
          </div>`
            : ""
        }

        ${
          achievements && achievements.length > 0 && achievements[0].title
            ? `
          <div style="margin-bottom:2rem;">
            <h2 style="font-size:1.25rem;font-weight:600;color:${C.text};margin:0 0 1rem 0;border-bottom:1px solid ${C.divider};padding-bottom:0.25rem;">
              Key Achievements
            </h2>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              ${achievements
                .map((achievement) =>
                  achievement.title
                    ? `
                <div style="border-left:3px solid ${C.accent};padding-left:1rem;">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.25rem;">
                    <h3 style="font-weight:600;color:${C.text};margin:0;">${achievement.title}</h3>
                    ${
                      achievement.date
                        ? `<span style="font-size:0.875rem;color:${C.subtleText};">${achievement.date}</span>`
                        : ""
                    }
                  </div>
                  ${
                    achievement.description
                      ? `<p style="color:${C.text};font-size:0.875rem;margin:0;text-align:justify;">${achievement.description}</p>`
                      : ""
                  }
                </div>`
                    : ""
                )
                .join("")}
            </div>
          </div>`
            : ""
        }
      </div>
    `;
  }
}

export function CVBuilder({ user, accessToken, onNavigate }) {
  const [cvData, setCvData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
      summary: "",
    },
    experience: [
      {
        id: 1,
        jobTitle: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ],
    education: [
      {
        id: 1,
        degree: "",
        institution: "",
        location: "",
        startDate: "",
        endDate: "",
        gpa: "",
        description: "",
      },
    ],
    skills: [],
    achievements: [
      {
        id: 1,
        title: "",
        description: "",
        date: "",
      },
    ],
    projects: [
      {
        id: 1,
        name: "",
        link: "",
        description: "",
        startDate: "",
        endDate: "",
        current: false,
      },
    ],
  });

  const [theme, setTheme] = useState(resolveTheme(DEFAULT_THEME_ID));

  const [newSkill, setNewSkill] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const resumeAPI = new ResumeAPI(user?.id || "default-user");

  useEffect(() => {
    loadSavedCV();
  }, []);

  const loadSavedCV = async () => {
    setIsLoading(true);
    try {
      const savedResumes = await resumeAPI.getResumes();
      if (savedResumes && savedResumes.length > 0) {
        const latestResume = savedResumes[0];
        setCvData({
          personalInfo: latestResume.personalInfo || cvData.personalInfo,
          experience: latestResume.experience || cvData.experience,
          education: latestResume.education || cvData.education,
          skills: latestResume.skills || cvData.skills,
          achievements: latestResume.achievements || cvData.achievements,
          projects: latestResume.projects || cvData.projects,
        });
      }
    } catch (error) {
      console.error("Error loading saved CV:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // AI helpers 
  const enhanceWithAI = async (type, content, context = {}, callback) => {
    const loadingKey = `${type}_${context.id || "main"}`;
    setAiLoading((prev) => ({ ...prev, [loadingKey]: true }));
    try {
      const enhanced = await AIEnhancementService.enhanceText(content, type, context);
      callback(enhanced);
    } catch (error) {
      alert(error.message);
    } finally {
      setAiLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const generateWithAI = async (type, context = {}, callback) => {
    const loadingKey = `generate_${type}${context.id ? "_" + context.id : ""}`;
    setAiLoading((prev) => ({ ...prev, [loadingKey]: true }));
    try {
      const generated = await AIEnhancementService.generateContent(type, context);
      callback(generated);
    } catch (error) {
      alert(error.message);
    } finally {
      setAiLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const suggestSkills = async () => {
    const context = {
      jobTitle: cvData.experience[0]?.jobTitle || "Professional",
      currentSkills: cvData.skills,
    };

    await enhanceWithAI("skills", "", context, (suggestions) => {
      const newSkills = suggestions
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s && !cvData.skills.includes(s));
      setCvData((prev) => ({
        ...prev,
        skills: [...prev.skills, ...newSkills.slice(0, 5)],
      }));
    });
  };

  // Handlers
  const handlePersonalInfoChange = (field, value) => {
    setCvData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const handleExperienceChange = (id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  };

  const addExperience = () => {
    const newId = Math.max(...cvData.experience.map((exp) => exp.id)) + 1;
    setCvData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: newId,
          jobTitle: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    }));
  };

  const removeExperience = (id) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const handleEducationChange = (id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));
  };

  const addEducation = () => {
    const newId = Math.max(...cvData.education.map((edu) => edu.id)) + 1;
    setCvData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: newId,
          degree: "",
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
          gpa: "",
          description: "",
        },
      ],
    }));
  };

  const removeEducation = (id) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !cvData.skills.includes(newSkill.trim())) {
      setCvData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setCvData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleAchievementChange = (id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      achievements: prev.achievements.map((ach) => (ach.id === id ? { ...ach, [field]: value } : ach)),
    }));
  };

  const addAchievement = () => {
    const newId = Math.max(...cvData.achievements.map((ach) => ach.id)) + 1;
    setCvData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { id: newId, title: "", description: "", date: "" }],
    }));
  };

  const removeAchievement = (id) => {
    setCvData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((ach) => ach.id !== id),
    }));
  };

  const handleProjectChange = (id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    }));
  };

  const addProject = () => {
    const newId = Math.max(...cvData.projects.map((proj) => proj.id)) + 1;
    setCvData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: newId,
          name: "",
          link: "",
          description: "",
          startDate: "",
          endDate: "",
          current: false,
        },
      ],
    }));
  };

  const removeProject = (id) => {
    setCvData((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== id),
    }));
  };

  const handleSave = async () => {
    try {
      const savedResume = await resumeAPI.saveResume(cvData);
      alert("CV saved successfully!");
    } catch (error) {
      console.error("Error saving CV:", error);
      alert(`Failed to save CV: ${error.message}`);
    }
  };

  const handlePreview = () => setShowPreview(true);
  const handleClosePreview = () => setShowPreview(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const firstName = cvData.personalInfo.firstName || "Resume";
      const lastName = cvData.personalInfo.lastName || "CV";
      const fileName = `${firstName}_${lastName}.pdf`.replace(/\s+/g, "_");
      await CVDownloader.generatePDF(cvData, theme, fileName);
    } catch (error) {
      console.error("Error downloading CV:", error);
      alert(`Failed to download CV: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your CV...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">CV Builder</h1>
            <p className="text-muted-foreground">Create a professional CV with AI assistance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save CV
            </Button>
          </div>
        </div>

        {/* NEW: Theme Picker */}
        <ThemePicker theme={theme} onChange={(t) => setTheme(resolveTheme(t))} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Basic contact information and professional summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={cvData.personalInfo.firstName}
                      onChange={(e) =>
                        handlePersonalInfoChange("firstName", e.target.value)
                      }
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={cvData.personalInfo.lastName}
                      onChange={(e) =>
                        handlePersonalInfoChange("lastName", e.target.value)
                      }
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={cvData.personalInfo.email}
                      onChange={(e) =>
                        handlePersonalInfoChange("email", e.target.value)
                      }
                      placeholder="john.doe@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={cvData.personalInfo.phone}
                      onChange={(e) =>
                        handlePersonalInfoChange("phone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={cvData.personalInfo.location}
                      onChange={(e) =>
                        handlePersonalInfoChange("location", e.target.value)
                      }
                      placeholder="New York, NY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={cvData.personalInfo.linkedin}
                      onChange={(e) =>
                        handlePersonalInfoChange("linkedin", e.target.value)
                      }
                      placeholder="linkedin.com/in/johndoe"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <AIEnhanceButton
                      onEnhance={() => enhanceWithAI(
                        'summary',
                        cvData.personalInfo.summary,
                        { jobTitle: cvData.experience[0]?.jobTitle },
                        (enhanced) => handlePersonalInfoChange("summary", enhanced)
                      )}
                      isLoading={aiLoading.summary_main}
                      disabled={!cvData.personalInfo.summary.trim()}
                    />
                  </div>
                  <Textarea
                    id="summary"
                    value={cvData.personalInfo.summary}
                    onChange={(e) =>
                      handlePersonalInfoChange("summary", e.target.value)
                    }
                    placeholder="Write a brief professional summary..."
                    rows={4}
                  />
                  {!cvData.personalInfo.summary.trim() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateWithAI(
                        'summary',
                        { 
                          jobTitle: cvData.experience[0]?.jobTitle || 'Professional',
                          skills: cvData.skills,
                          experience: cvData.experience.length
                        },
                        (generated) => handlePersonalInfoChange("summary", generated)
                      )}
                      disabled={aiLoading.generate_summary}
                      className="w-full"
                    >
                      {aiLoading.generate_summary ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Summary with AI
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Work Experience</CardTitle>
                    <CardDescription>
                      Add your work experience in reverse chronological order
                    </CardDescription>
                  </div>
                  <Button onClick={addExperience} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {cvData.experience.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="p-4 border border-border rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">Experience {index + 1}</Badge>
                      {cvData.experience.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(exp.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input
                          value={exp.jobTitle}
                          onChange={(e) =>
                            handleExperienceChange(
                              exp.id,
                              "jobTitle",
                              e.target.value
                            )
                          }
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) =>
                            handleExperienceChange(
                              exp.id,
                              "company",
                              e.target.value
                            )
                          }
                          placeholder="Tech Company Inc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) =>
                            handleExperienceChange(
                              exp.id,
                              "startDate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) =>
                            handleExperienceChange(
                              exp.id,
                              "endDate",
                              e.target.value
                            )
                          }
                          disabled={exp.current}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Description</Label>
                        <AIEnhanceButton
                          onEnhance={() => enhanceWithAI(
                            'experience',
                            exp.description,
                            { 
                              id: exp.id,
                              jobTitle: exp.jobTitle,
                              company: exp.company
                            },
                            (enhanced) => handleExperienceChange(exp.id, "description", enhanced)
                          )}
                          isLoading={aiLoading[`experience_${exp.id}`]}
                          disabled={!exp.description.trim()}
                        />
                      </div>
                      <Textarea
                        value={exp.description}
                        onChange={(e) =>
                          handleExperienceChange(
                            exp.id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe your responsibilities and achievements..."
                        rows={4}
                      />
                      {!exp.description.trim() && exp.jobTitle && exp.company && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateWithAI(
                            'experience',
                            { 
                              jobTitle: exp.jobTitle,
                              company: exp.company
                            },
                            (generated) => handleExperienceChange(exp.id, "description", generated)
                          )}
                          disabled={aiLoading[`generate_experience_${exp.id}`]}
                          className="w-full"
                        >
                          {aiLoading[`generate_experience_${exp.id}`] ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Description with AI
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>
                      Add your educational background
                    </CardDescription>
                  </div>
                  <Button onClick={addEducation} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {cvData.education.map((edu, index) => (
                  <div
                    key={edu.id}
                    className="p-4 border border-border rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">Education {index + 1}</Badge>
                      {cvData.education.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(edu.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) =>
                            handleEducationChange(edu.id, "degree", e.target.value)
                          }
                          placeholder="Bachelor of Science in Computer Science"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              "institution",
                              e.target.value
                            )
                          }
                          placeholder="University of Technology"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              "startDate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              "endDate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Skills & Achievements</CardTitle>
                <CardDescription>
                  Add your technical skills and key achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Technical Skills</h3>
                    <AIEnhanceButton
                      onEnhance={suggestSkills}
                      isLoading={aiLoading.skills_main}
                      disabled={false}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Suggest Skills
                    </AIEnhanceButton>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button onClick={addSkill} type="button">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-auto p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSkill(skill)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Key Achievements</h3>
                    <Button onClick={addAchievement} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Achievement
                    </Button>
                  </div>

                  {cvData.achievements.map((achievement, index) => (
                    <div
                      key={achievement.id}
                      className="p-4 border border-border rounded-lg space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Achievement {index + 1}</Badge>
                        {cvData.achievements.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAchievement(achievement.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Achievement Title</Label>
                          <Input
                            value={achievement.title}
                            onChange={(e) =>
                              handleAchievementChange(
                                achievement.id,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Employee of the Month"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Description</Label>
                            <AIEnhanceButton
                              onEnhance={() => enhanceWithAI(
                                'achievement',
                                achievement.description,
                                { 
                                  id: achievement.id,
                                  jobTitle: cvData.experience[0]?.jobTitle
                                },
                                (enhanced) => handleAchievementChange(achievement.id, "description", enhanced)
                              )}
                              isLoading={aiLoading[`achievement_${achievement.id}`]}
                              disabled={!achievement.description.trim()}
                            />
                          </div>
                          <Textarea
                            value={achievement.description}
                            onChange={(e) =>
                              handleAchievementChange(
                                achievement.id,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Describe your achievement..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>
                      Add personal or academic projects with descriptions and dates
                    </CardDescription>
                  </div>
                  <Button onClick={addProject} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {cvData.projects.map((project, index) => (
                  <div
                    key={project.id}
                    className="p-4 border border-border rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">Project {index + 1}</Badge>
                      {cvData.projects.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(project.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input
                          value={project.name}
                          onChange={(e) =>
                            handleProjectChange(project.id, "name", e.target.value)
                          }
                          placeholder="FixMate – Handyman Finder"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Link</Label>
                        <Input
                          value={project.link}
                          onChange={(e) =>
                            handleProjectChange(project.id, "link", e.target.value)
                          }
                          placeholder="https://github.com/yourrepo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={project.startDate}
                          onChange={(e) =>
                            handleProjectChange(project.id, "startDate", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={project.endDate}
                          onChange={(e) =>
                            handleProjectChange(project.id, "endDate", e.target.value)
                          }
                          disabled={project.current}
                        />
                        
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Description</Label>
                        <AIEnhanceButton
                          onEnhance={() => enhanceWithAI(
                            'project',
                            project.description,
                            { 
                              id: project.id,
                              projectName: project.name
                            },
                            (enhanced) => handleProjectChange(project.id, "description", enhanced)
                          )}
                          isLoading={aiLoading[`project_${project.id}`]}
                          disabled={!project.description.trim()}
                        />
                      </div>
                      <Textarea
                        value={project.description}
                        onChange={(e) =>
                          handleProjectChange(project.id, "description", e.target.value)
                        }
                        placeholder="Describe the project, technologies used, and key achievements..."
                        rows={4}
                      />
                      {!project.description.trim() && project.name && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateWithAI(
                            'project',
                            { 
                              projectName: project.name,
                              id: project.id
                            },
                            (generated) => handleProjectChange(project.id, "description", generated)
                          )}
                          disabled={aiLoading[`generate_project_${project.id}`]}
                          className="w-full"
                        >
                          {aiLoading[`generate_project_${project.id}`] ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Description with AI
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>          
        </Tabs>
      </div>

      {showPreview && <CVPreview cvData={cvData} onClose={handleClosePreview} theme={theme} />}
    </>
  );
}