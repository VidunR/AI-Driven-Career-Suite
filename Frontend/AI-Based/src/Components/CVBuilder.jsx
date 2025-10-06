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
  CheckCircle2,
} from "lucide-react";

import ThemePicker from "./ThemePicker";
import { resolveTheme, DEFAULT_THEME_ID } from "../themes/cvThemes";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/* ----------------------- Shared Animations (Dashboard parity) ---------------------- */
const AnimationStyles = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideInFromTop { from { opacity: 0; transform: translateY(-1rem) } to { opacity: 1; transform: translateY(0) } }
    @keyframes slideInFromBottom { from { opacity: 0; transform: translateY(1rem) } to { opacity: 1; transform: translateY(0) } }
    @keyframes slideInFromLeft { from { opacity: 0; transform: translateX(-1rem) } to { opacity: 1; transform: translateX(0) } }
    @keyframes slideInFromRight { from { opacity: 0; transform: translateX(1rem) } to { opacity: 1; transform: translateX(0) } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
    @keyframes float { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-8px) } }
    @keyframes shimmer { 0% { background-position: -1000px 0 } 100% { background-position: 1000px 0 } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.18) } 50% { box-shadow: 0 0 28px rgba(147,51,234,0.28) } }

    .animate-fade-in { animation: fadeIn .6s ease-out forwards }
    .animate-slide-in-top { animation: slideInFromTop .6s ease-out forwards }
    .animate-slide-in-bottom { animation: slideInFromBottom .6s ease-out forwards }
    .animate-slide-in-left { animation: slideInFromLeft .6s ease-out forwards }
    .animate-slide-in-right { animation: slideInFromRight .6s ease-out forwards }
    .animate-scale-in { animation: scaleIn .45s ease-out forwards }
    .animate-float { animation: float 3s ease-in-out infinite }
    .animate-glow { animation: glow 2.2s ease-in-out infinite }

    .opacity-0 { opacity: 0 }
    .delay-100 { animation-delay: .1s }
    .delay-200 { animation-delay: .2s }
    .delay-300 { animation-delay: .3s }
    .delay-400 { animation-delay: .4s }
    .delay-500 { animation-delay: .5s }
    .delay-600 { animation-delay: .6s }
    .delay-700 { animation-delay: .7s }
    .delay-800 { animation-delay: .8s }
    .delay-900 { animation-delay: .9s }
    .delay-1000 { animation-delay: 1s }

    .glass {
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.08);
    }

    .action-card {
      transition: transform .35s cubic-bezier(.22,.61,.36,1), box-shadow .35s;
      position: relative;
      overflow: hidden;
    }
    .action-card:hover { transform: translateY(-6px) scale(1.01) }
    .action-card::after {
      content:'';
      position:absolute; inset:0;
      background: linear-gradient(135deg, rgba(99,102,241,0.10), rgba(147,51,234,0.10), rgba(236,72,153,0.08));
      opacity:0; transition: opacity .35s;
      pointer-events: none;
    }
    .action-card:hover::after { opacity:.7 }

    .field-card { transition: background .3s, transform .25s }
    .field-card:hover { transform: translateY(-3px) }

    .shimmer {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent);
      background-size: 1000px 100%;
      animation: shimmer 2s infinite;
    }

    .gradient-title {
      background: linear-gradient(135deg, #8b5cf6 0%, #22d3ee 50%, #ec4899 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .calm-bg {
      background: radial-gradient(1200px 600px at 0% 0%, rgba(34,211,238,0.08), transparent 60%),
                  radial-gradient(1000px 500px at 100% 20%, rgba(139,92,246,0.10), transparent 55%),
                  radial-gradient(900px 500px at 50% 100%, rgba(236,72,153,0.08), transparent 50%);
    }

    /* soft separators on cards */
    .soft-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    }
  `}</style>
);

/* ------------------------------ AI Helpers (unchanged) ----------------------------- */
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

/* --------------------------- Tiny component (unchanged) ---------------------------- */
function AIEnhanceButton({ onEnhance, isLoading, disabled, size = "sm", variant = "outline" }) {
  return (
    <Button onClick={onEnhance} disabled={disabled || isLoading} size={size} variant={variant} className="gap-2">
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
      {isLoading ? "Enhancing..." : "Enhance with AI"}
    </Button>
  );
}

/* -------------------------------- PDF utilities ----------------------------------- */
class CVDownloader {
  static generatePDF(cvData, theme, filename = "resume.pdf") {
    const element = document.createElement("div");
    element.innerHTML = this.generateCVHTML(cvData, theme);

    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
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
                    <div style="font-size:0.875rem;color:${C.subtleText};text-align:right;">📅 ${edu.startDate || ""} - ${edu.endDate || ""}</div>
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
                      ${project.link ? `<p style="color:${C.project};font-size:0.875rem;margin:0 0 0.25rem 0;">🔗 ${project.link}</p>` : ""}
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
                    ${achievement.date ? `<span style="font-size:0.875rem;color:${C.subtleText};">${achievement.date}</span>` : ""}
                  </div>
                  ${achievement.description ? `<p style="color:${C.text};font-size:0.875rem;margin:0;text-align:justify;">${achievement.description}</p>` : ""}
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

/* ---------------------------------- Component ------------------------------------- */
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
        apiId: undefined,
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
        apiId: undefined,
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
        apiId: undefined,
        title: "",
        description: "",
        date: "",
      },
    ],
    projects: [
      {
        id: 1,
        apiId: undefined,
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
  const [skillsIdMap, setSkillsIdMap] = useState({});
  const [activeTab, setActiveTab] = useState("personal");
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const resumeAPI = new ResumeAPI(user?.id || "default-user");

  // ---- API helpers ----
  const API_BASE = "http://localhost:5000/cvbuilder";

  const getStoredToken = () => {
    const keys = ["jwtToken", "token", "accessToken", "authToken"];
    let t = null;
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v) {
        t = v;
        break;
      }
    }
    if (!t && accessToken) t = accessToken;
    return t || "";
  };

  const api = axios.create({ baseURL: API_BASE });

  api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }
    return config;
  });

  const safeArray = (d) =>
    Array.isArray(d)
      ? d
      : Array.isArray(d?.data)
      ? d.data
      : Array.isArray(d?.result)
      ? d.result
      : Array.isArray(d?.items)
      ? d.items
      : [];

  useEffect(() => {
    loadSavedCV();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toInputDate = (iso) => {
    if (!iso) return "";
    const parts = String(iso).split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(parts)) return parts;
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const mapPersonal = (u = {}) => {
    const root = u?.data && typeof u.data === "object" ? u.data : u;
    const address = root?.address || "";
    const country = root?.country || "";
    const location = [address, country].filter(Boolean).join(", ");
    return {
      firstName: root?.firstName || "",
      lastName: root?.lastName || "",
      email: root?.email || "",
      phone: root?.phoneNumber || "",
      location,
      linkedin: root?.linkedInURL || "",
      website: "",
      summary: root?.bio || "",
    };
  };

  const mapExperience = (arr = []) =>
    arr.map((e) => ({
      id: e.experienceId ?? e.id ?? Math.random(),
      apiId: e.experienceId ?? e.id,
      jobTitle: e.jobTitle || "",
      company: e.company || "",
      location: e.location || "",
      startDate: toInputDate(e.startDate),
      endDate: toInputDate(e.endDate),
      current: !e.endDate,
      description: e.description || "",
    }));

  const mapEducation = (arr = []) =>
    arr.map((e) => ({
      id: e.educationId ?? e.id ?? Math.random(),
      apiId: e.educationId ?? e.id,
      degree: e.degree || "",
      institution: e.institution || "",
      location: e.location || "",
      startDate: toInputDate(e.startDate),
      endDate: toInputDate(e.endDate),
      gpa: e.gpa || "",
      description: e.description || "",
    }));

  const mapProjects = (arr = []) =>
    arr.map((p) => ({
      id: p.projectId ?? p.id ?? Math.random(),
      apiId: p.projectId ?? p.id,
      name: p.projectName || "",
      link: p.githublink || p.githubLink || p.link || "",
      description: p.projectDescription || p.description || "",
      startDate: toInputDate(p.startDate),
      endDate: toInputDate(p.endDate),
      current: !p.endDate,
    }));

  const extractSkillId = (raw) =>
    raw?.skillId ??
    raw?.id ??
    raw?.skillID ??
    raw?.skill?.skillId ??
    raw?.skill?.id;

  const mapSkillsList = (arr = []) =>
    arr
      .map((s) => s?.skill?.skillName || s?.skillName || s?.name || s?.title || "")
      .filter(Boolean);

  const mapSkillsIdMap = (arr = []) =>
    arr.reduce((acc, item) => {
      const name =
        item?.skill?.skillName || item?.skillName || item?.name || item?.title;
      const id = extractSkillId(item);
      if (name && id) acc[name] = id;
      return acc;
    }, {});

  const mapAchievements = (arr = []) =>
    arr.map((a) => ({
      id: a.achievementId ?? a.id ?? Math.random(),
      apiId: a.achievementId ?? a.id,
      title: a.achievementTitle || a.title || "",
      description: a.achievementDescription || a.description || "",
      date: a.date ? toInputDate(a.date) : "",
    }));

  const loadSavedCV = async () => {
    setIsLoading(true);
    try {
      const [
        userRes,
        eduRes,
        expRes,
        projRes,
        skillsRes,
        achRes,
      ] = await Promise.allSettled([
        api.get(`/user`),
        api.get(`/education`),
        api.get(`/experience`),
        api.get(`/project`),
        api.get(`/skills`),
        api.get(`/achievement`),
      ]);

      const userData = userRes.status === "fulfilled" ? userRes.value?.data : {};
      const personalInfo = mapPersonal(userData || {});

      const educationRaw =
        eduRes.status === "fulfilled" ? eduRes.value?.data : [];
      const education = mapEducation(safeArray(educationRaw));

      const experienceRaw =
        expRes.status === "fulfilled" ? expRes.value?.data : [];
      const experience = mapExperience(safeArray(experienceRaw));

      const projectsRaw =
        projRes.status === "fulfilled" ? projRes.value?.data : [];
      const projects = mapProjects(safeArray(projectsRaw));

      const skillsRaw =
        skillsRes.status === "fulfilled" ? skillsRes.value?.data : [];
      const skills = mapSkillsList(safeArray(skillsRaw));
      const skillsMap = mapSkillsIdMap(safeArray(skillsRaw));

      const achRaw =
        achRes.status === "fulfilled" ? achRes.value?.data : [];
      const achievements = mapAchievements(safeArray(achRaw));

      setSkillsIdMap(skillsMap);

      setCvData((prev) => ({
        ...prev,
        personalInfo: personalInfo || prev.personalInfo,
        education: education.length ? education : prev.education,
        experience: experience.length ? experience : prev.experience,
        projects: projects.length ? projects : prev.projects,
        skills: skills.length ? skills : prev.skills,
        achievements: achievements.length ? achievements : prev.achievements,
      }));
    } catch (error) {
      console.error("Unexpected error loading CV data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // AI helpers
  const enhanceWithAI = async (type, content, context = {}, callback) => {
    const loadingKey = `${type}_${context.id || "main"}`;
    setAiLoading((prev) => ({ ...prev, [loadingKey]: true }));
    try {
      const enhanced = await AIEnhancementService.enhanceText(
        content,
        type,
        context
      );
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
      const generated = await AIEnhancementService.generateContent(
        type,
        context
      );
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

  // Utilities
  const nextId = (arr) =>
    arr.length ? arr.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1 : 1;

  const isNonEmptyExperience = (e) =>
    e.jobTitle || e.company || e.description || e.startDate || e.endDate;

  const isNonEmptyEducation = (e) =>
    e.degree || e.institution || e.description || e.startDate || e.endDate;

  const isNonEmptyProject = (p) =>
    p.name || p.link || p.description || p.startDate || p.endDate;

  const isNonEmptyAchievement = (a) => a.title || a.description || a.date;

  const pickFirst = (obj, keys) => {
    for (const k of keys) {
      if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
    }
    return undefined;
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
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addExperience = () => {
    const newId = nextId(cvData.experience);
    setCvData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: newId,
          apiId: undefined,
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

  const removeExperience = async (id) => {
    const target = cvData.experience.find((e) => e.id === id);
    try {
      if (target?.apiId) {
        await api.delete(`/experience/${target.apiId}`);
      }
    } catch (err) {
      console.error("Failed to delete experience on server:", err);
    } finally {
      setCvData((prev) => ({
        ...prev,
        experience: prev.experience.filter((exp) => exp.id !== id),
      }));
    }
  };

  const handleEducationChange = (id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addEducation = () => {
    const newId = nextId(cvData.education);
    setCvData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: newId,
          apiId: undefined,
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

  const removeEducation = async (id) => {
    const target = cvData.education.find((e) => e.id === id);
    try {
      if (target?.apiId) {
        await api.delete(`/education/${target.apiId}`);
      }
    } catch (err) {
      console.error("Failed to delete education on server:", err);
    } finally {
      setCvData((prev) => ({
        ...prev,
        education: prev.education.filter((edu) => edu.id !== id),
      }));
    }
  };

  const addSkill = async () => {
    if (newSkill.trim() && !cvData.skills.includes(newSkill.trim())) {
      setCvData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = async (skillToRemove) => {
    const serverId = skillsIdMap[skillToRemove];
    try {
      if (serverId) {
        await api.delete(`/skills/${serverId}`);
      }
    } catch (err) {
      console.error("Failed to delete skill on server:", err);
    } finally {
      setCvData((prev) => ({
        ...prev,
        skills: prev.skills.filter((skill) => skill !== skillToRemove),
      }));
      setSkillsIdMap((prev) => {
        const n = { ...prev };
        delete n[skillToRemove];
        return n;
      });
    }
  };

  const handleAchievementChange = (id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      achievements: prev.achievements.map((ach) =>
        ach.id === id ? { ...ach, [field]: value } : ach
      ),
    }));
  };

  const addAchievement = () => {
    const newId = nextId(cvData.achievements);
    setCvData((prev) => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        { id: newId, apiId: undefined, title: "", description: "", date: "" },
      ],
    }));
  };

  const removeAchievement = async (id) => {
    const target = cvData.achievements.find((a) => a.id === id);
    try {
      if (target?.apiId) {
        await api.delete(`/achievement/${target.apiId}`);
      }
    } catch (err) {
      console.error("Failed to delete achievement on server:", err);
    } finally {
      setCvData((prev) => ({
        ...prev,
        achievements: prev.achievements.filter((ach) => ach.id !== id),
      }));
    }
  };

  const handleProjectChange = (id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const addProject = () => {
    const newId = nextId(cvData.projects);
    setCvData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: newId,
          apiId: undefined,
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

  const removeProject = async (id) => {
    const target = cvData.projects.find((p) => p.id === id);
    try {
      if (target?.apiId) {
        await api.delete(`/project/${target.apiId}`);
      }
    } catch (err) {
      console.error("Failed to delete project on server:", err);
    } finally {
      setCvData((prev) => ({
        ...prev,
        projects: prev.projects.filter((proj) => proj.id !== id),
      }));
    }
  };

  async function buildPdfBlob(cvData, theme, filename) {
    const element = document.createElement("div");
    element.innerHTML = CVDownloader.generateCVHTML(cvData, theme);

    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    const blob = await html2pdf().set(options).from(element).toPdf().output("blob");
    return blob;
  }

  const saveNewDetails = async () => {
    const newExperiences = cvData.experience.filter(
      (e) => !e.apiId && isNonEmptyExperience(e)
    );
    const newEducation = cvData.education.filter(
      (e) => !e.apiId && isNonEmptyEducation(e)
    );
    const newProjects = cvData.projects.filter(
      (p) => !p.apiId && isNonEmptyProject(p)
    );
    const newAchievements = cvData.achievements.filter(
      (a) => !a.apiId && isNonEmptyAchievement(a)
    );
    const newSkills = cvData.skills.filter((s) => !skillsIdMap[s]);

    const results = { exp: [], edu: [], proj: [], ach: [], skills: [] };

    // POST experiences
    for (const e of newExperiences) {
      try {
        const payload = {
          jobTitle: e.jobTitle,
          company: e.company,
          location: e.location,
          startDate: e.startDate || null,
          endDate: e.current ? null : e.endDate || null,
          description: e.description,
        };
        const res = await api.post(`/experience`, payload);
        const data = res?.data || {};
        const newId =
          pickFirst(data, ["experienceId", "id", "experienceID"]) ??
          pickFirst(data?.data || {}, ["experienceId", "id", "experienceID"]);
        results.exp.push({ localId: e.id, apiId: newId });
      } catch (err) {
        console.error("Failed to save experience:", err);
      }
    }

    // POST education
    for (const ed of newEducation) {
      try {
        const payload = {
          degree: ed.degree,
          institution: ed.institution,
          location: ed.location,
          startDate: ed.startDate || null,
          endDate: ed.endDate || null,
          gpa: ed.gpa || null,
          description: ed.description,
        };
        const res = await api.post(`/education`, payload);
        const data = res?.data || {};
        const newId =
          pickFirst(data, ["educationId", "id", "educationID"]) ??
          pickFirst(data?.data || {}, ["educationId", "id", "educationID"]);
        results.edu.push({ localId: ed.id, apiId: newId });
      } catch (err) {
        console.error("Failed to save education:", err);
      }
    }

    // POST projects
    for (const p of newProjects) {
      try {
        const payload = {
          projectName: p.name,
          name: p.name,
          githublink: p.link,
          githubLink: p.link,
          link: p.link,
          projectDescription: p.description,
          description: p.description,
          startDate: p.startDate || null,
          endDate: p.current ? null : p.endDate || null,
        };
        const res = await api.post(`/project`, payload);
        const data = res?.data || {};
        const newId =
          pickFirst(data, ["projectId", "id", "projectID"]) ??
          pickFirst(data?.data || {}, ["projectId", "id", "projectID"]);
        results.proj.push({ localId: p.id, apiId: newId });
      } catch (err) {
        console.error("Failed to save project:", err);
      }
    }

    // POST achievements
    for (const a of newAchievements) {
      try {
        const payload = {
          achievementTitle: a.title,
          title: a.title,
          achievementDescription: a.description,
          description: a.description,
          date: a.date || null,
        };
        const res = await api.post(`/achievement`, payload);
        const data = res?.data || {};
        const newId =
          pickFirst(data, ["achievementId", "id", "achievementID"]) ??
          pickFirst(data?.data || {}, ["achievementId", "id", "achievementID"]);
        results.ach.push({ localId: a.id, apiId: newId });
      } catch (err) {
        console.error("Failed to save achievement:", err);
      }
    }

    // POST skills
    for (const s of newSkills) {
      try {
        const payload = { skillName: s };
        const res = await api.post(`/skills`, payload);
        const data = res?.data || {};
        const newId =
          pickFirst(data, ["skillId", "id", "skillID"]) ??
          pickFirst(data?.data || {}, ["skillId", "id", "skillID"]);
        results.skills.push({ name: s, apiId: newId });
      } catch (err) {
        console.error("Failed to save skill:", err);
      }
    }

    // Update local state
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => {
        const saved = results.exp.find((x) => x.localId === e.id && x.apiId);
        return saved ? { ...e, apiId: saved.apiId } : e;
      }),
      education: prev.education.map((ed) => {
        const saved = results.edu.find((x) => x.localId === ed.id && x.apiId);
        return saved ? { ...ed, apiId: saved.apiId } : ed;
      }),
      projects: prev.projects.map((p) => {
        const saved = results.proj.find((x) => x.localId === p.id && x.apiId);
        return saved ? { ...p, apiId: saved.apiId } : p;
      }),
      achievements: prev.achievements.map((a) => {
        const saved = results.ach.find((x) => x.localId === a.id && x.apiId);
        return saved ? { ...a, apiId: saved.apiId } : a;
      }),
    }));

    if (results.skills.length) {
      setSkillsIdMap((prev) => {
        const updated = { ...prev };
        for (const s of results.skills) {
          if (s.name && s.apiId) updated[s.name] = s.apiId;
        }
        return updated;
      });
    }
  };

  const handleSave = async () => {
    try {
      await saveNewDetails();

      const firstName = cvData.personalInfo.firstName || "Resume";
      const lastName = cvData.personalInfo.lastName || "CV";
      const fileName = `${firstName}_${lastName}.pdf`.replace(/\s+/g, "_");

      const pdfBlob = await buildPdfBlob(cvData, theme, fileName);

      const file = new File([pdfBlob], fileName, { type: "application/pdf" });
      await resumeAPI.uploadFile(file, fileName);

      alert("CV details saved and PDF uploaded! You can now preview it in CV Manager.");
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
      <div className="flex items-center justify-center min-h-screen calm-bg">
        <AnimationStyles />
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your CV...</p>
        </div>
      </div>
    );
  }

  /* ---------------------------------- UI ---------------------------------- */
  return (
    <>
      <AnimationStyles />

      {/* Subtle calming background */}
      <div className="calm-bg">
        <div className="p-6 max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 opacity-0 animate-slide-in-top">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold gradient-title flex items-center gap-2">
                <Sparkles className="w-6 h-6 animate-float" />
                CV Builder
              </h1>
              <p className="text-muted-foreground">
                Create a professional CV with AI assistance
              </p>
            </div>

            {/* Action bar */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreview} className="action-card">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={handleDownload} disabled={isDownloading} className="action-card">
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Downloading..." : "Download"}
              </Button>
              <Button onClick={handleSave} className="action-card animate-glow">
                <Save className="w-4 h-4 mr-2" />
                Save CV
              </Button>
            </div>
          </div>

          {/* Theme picker with gentle reveal */}
          <div className="opacity-0 animate-scale-in delay-200">
            <Card className="glass">
              <CardContent className="p-4">
                <ThemePicker theme={theme} onChange={(t) => setTheme(resolveTheme(t))} />
              </CardContent>
            </Card>
          </div>

          {/* Tabs styled like premium dashboard sections */}
          <div className="opacity-0 animate-slide-in-bottom delay-300">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 glass">
                <TabsTrigger value="personal" className="flex items-center gap-2 transition-all data-[state=active]:scale-105">
                  <User className="w-4 h-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="experience" className="flex items-center gap-2 transition-all data-[state=active]:scale-105">
                  <Briefcase className="w-4 h-4" />
                  Experience
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center gap-2 transition-all data-[state=active]:scale-105">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center gap-2 transition-all data-[state=active]:scale-105">
                  <Award className="w-4 h-4" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-2 transition-all data-[state=active]:scale-105">
                  <Award className="w-4 h-4" />
                  Projects
                </TabsTrigger>
              </TabsList>

              {/* PERSONAL */}
              <TabsContent value="personal" className="space-y-6 opacity-0 animate-fade-in delay-100">
                <Card className="glass action-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Basic contact information and professional summary</CardDescription>
                  </CardHeader>
                  <div className="soft-divider mx-6"></div>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* field groups */}
                      <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={cvData.personalInfo.firstName}
                          onChange={(e) => handlePersonalInfoChange("firstName", e.target.value)}
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={cvData.personalInfo.lastName}
                          onChange={(e) => handlePersonalInfoChange("lastName", e.target.value)}
                          placeholder="Doe"
                        />
                      </div>
                      <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={cvData.personalInfo.email}
                          onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                          placeholder="john.doe@email.com"
                        />
                      </div>
                      <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={cvData.personalInfo.phone}
                          onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                          placeholder="+94 7X XXX XXXX"
                        />
                      </div>
                      <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={cvData.personalInfo.location}
                          onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                          placeholder="Colombo, Sri Lanka"
                        />
                      </div>
                      <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={cvData.personalInfo.linkedin}
                          onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
                          placeholder="linkedin.com/in/yourname"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="summary">Professional Summary</Label>
                        <AIEnhanceButton
                          onEnhance={() =>
                            enhanceWithAI(
                              "summary",
                              cvData.personalInfo.summary,
                              { jobTitle: cvData.experience[0]?.jobTitle },
                              (enhanced) => handlePersonalInfoChange("summary", enhanced)
                            )
                          }
                          isLoading={aiLoading.summary_main}
                          disabled={!cvData.personalInfo.summary.trim()}
                        />
                      </div>
                      <Textarea
                        id="summary"
                        value={cvData.personalInfo.summary}
                        onChange={(e) => handlePersonalInfoChange("summary", e.target.value)}
                        placeholder="Write a brief professional summary..."
                        rows={4}
                        className="transition-shadow focus:shadow-lg"
                      />
                      {!cvData.personalInfo.summary.trim() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            generateWithAI(
                              "summary",
                              {
                                jobTitle: cvData.experience[0]?.jobTitle || "Professional",
                                skills: cvData.skills,
                                experience: cvData.experience.length,
                              },
                              (generated) => handlePersonalInfoChange("summary", generated)
                            )
                          }
                          disabled={aiLoading.generate_summary}
                          className="w-full action-card"
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

              {/* EXPERIENCE */}
              <TabsContent value="experience" className="space-y-6 opacity-0 animate-fade-in delay-100">
                <Card className="glass action-card">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Work Experience</CardTitle>
                        <CardDescription>Add your work experience in reverse chronological order</CardDescription>
                      </div>
                      <Button onClick={addExperience} size="sm" className="action-card">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                  </CardHeader>
                  <div className="soft-divider mx-6"></div>
                  <CardContent className="space-y-6">
                    {cvData.experience.map((exp, index) => (
                      <div
                        key={exp.id}
                        className="p-4 border border-border rounded-xl space-y-4 opacity-0 animate-slide-in-right"
                        style={{ animationDelay: `${0.12 * (index + 1)}s` }}
                      >
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">Experience {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(exp.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>Job Title</Label>
                            <Input
                              value={exp.jobTitle}
                              onChange={(e) => handleExperienceChange(exp.id, "jobTitle", e.target.value)}
                              placeholder="Software Engineer"
                            />
                          </div>
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                              placeholder="Tech Company Inc."
                            />
                          </div>
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) => handleExperienceChange(exp.id, "startDate", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={exp.endDate}
                              onChange={(e) => handleExperienceChange(exp.id, "endDate", e.target.value)}
                              disabled={exp.current}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Description</Label>
                            <AIEnhanceButton
                              onEnhance={() =>
                                enhanceWithAI(
                                  "experience",
                                  exp.description,
                                  { id: exp.id, jobTitle: exp.jobTitle, company: exp.company },
                                  (enhanced) => handleExperienceChange(exp.id, "description", enhanced)
                                )
                              }
                              isLoading={aiLoading[`experience_${exp.id}`]}
                              disabled={!exp.description.trim()}
                            />
                          </div>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                            rows={4}
                            className="transition-shadow focus:shadow-lg"
                          />
                          {!exp.description.trim() && exp.jobTitle && exp.company && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                generateWithAI(
                                  "experience",
                                  { jobTitle: exp.jobTitle, company: exp.company },
                                  (generated) => handleExperienceChange(exp.id, "description", generated)
                                )
                              }
                              disabled={aiLoading[`generate_experience_${exp.id}`]}
                              className="w-full action-card"
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

              {/* EDUCATION */}
              <TabsContent value="education" className="space-y-6 opacity-0 animate-fade-in delay-100">
                <Card className="glass action-card">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Education</CardTitle>
                        <CardDescription>Add your educational background</CardDescription>
                      </div>
                      <Button onClick={addEducation} size="sm" className="action-card">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                  </CardHeader>
                  <div className="soft-divider mx-6"></div>
                  <CardContent className="space-y-6">
                    {cvData.education.map((edu, index) => (
                      <div
                        key={edu.id}
                        className="p-4 border border-border rounded-xl space-y-4 opacity-0 animate-slide-in-right"
                        style={{ animationDelay: `${0.12 * (index + 1)}s` }}
                      >
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">Education {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(edu.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                              placeholder="BSc in Computer Science"
                            />
                          </div>
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => handleEducationChange(edu.id, "institution", e.target.value)}
                              placeholder="University of ..."
                            />
                          </div>
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={edu.startDate}
                              onChange={(e) => handleEducationChange(edu.id, "startDate", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={edu.endDate}
                              onChange={(e) => handleEducationChange(edu.id, "endDate", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SKILLS + ACHIEVEMENTS */}
              <TabsContent value="skills" className="space-y-6 opacity-0 animate-fade-in delay-100">
                <Card className="glass action-card">
                  <CardHeader>
                    <CardTitle>Skills & Achievements</CardTitle>
                    <CardDescription>Add your technical skills and key achievements</CardDescription>
                  </CardHeader>
                  <div className="soft-divider mx-6"></div>
                  <CardContent className="space-y-8">
                    {/* Skills */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Technical Skills</h3>
                        <AIEnhanceButton
                          onEnhance={suggestSkills}
                          isLoading={aiLoading.skills_main}
                          disabled={false}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill..."
                          onKeyDown={(e) => e.key === "Enter" && addSkill()}
                          className="transition-shadow focus:shadow-md"
                        />
                        <Button onClick={addSkill} type="button" className="action-card">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {cvData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 action-card">
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

                    {/* Achievements */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Key Achievements</h3>
                        <Button onClick={addAchievement} size="sm" className="action-card">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Achievement
                        </Button>
                      </div>

                      {cvData.achievements.map((achievement, index) => (
                        <div
                          key={achievement.id}
                          className="p-4 border border-border rounded-xl space-y-4 opacity-0 animate-slide-in-right"
                          style={{ animationDelay: `${0.12 * (index + 1)}s` }}
                        >
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">Achievement {index + 1}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAchievement(achievement.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                              <Label>Achievement Title</Label>
                              <Input
                                value={achievement.title}
                                onChange={(e) =>
                                  handleAchievementChange(achievement.id, "title", e.target.value)
                                }
                                placeholder="Employee of the Month"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label>Description</Label>
                                <AIEnhanceButton
                                  onEnhance={() =>
                                    enhanceWithAI(
                                      "achievement",
                                      achievement.description,
                                      { id: achievement.id, jobTitle: cvData.experience[0]?.jobTitle },
                                      (enhanced) =>
                                        handleAchievementChange(achievement.id, "description", enhanced)
                                    )
                                  }
                                  isLoading={aiLoading[`achievement_${achievement.id}`]}
                                  disabled={!achievement.description.trim()}
                                />
                              </div>
                              <Textarea
                                value={achievement.description}
                                onChange={(e) =>
                                  handleAchievementChange(achievement.id, "description", e.target.value)
                                }
                                placeholder="Describe your achievement..."
                                rows={3}
                                className="transition-shadow focus:shadow-lg"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PROJECTS */}
              <TabsContent value="projects" className="space-y-6 opacity-0 animate-fade-in delay-100">
                <Card className="glass action-card">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>Add personal or academic projects with descriptions and dates</CardDescription>
                      </div>
                      <Button onClick={addProject} size="sm" className="action-card">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                      </Button>
                    </div>
                  </CardHeader>
                  <div className="soft-divider mx-6"></div>
                  <CardContent className="space-y-6">
                    {cvData.projects.map((project, index) => (
                      <div
                        key={project.id}
                        className="p-4 border border-border rounded-xl space-y-4 opacity-0 animate-slide-in-right"
                        style={{ animationDelay: `${0.12 * (index + 1)}s` }}
                      >
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">Project {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProject(project.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>Project Name</Label>
                            <Input
                              value={project.name}
                              onChange={(e) => handleProjectChange(project.id, "name", e.target.value)}
                              placeholder="FixMate – Handyman Finder"
                            />
                          </div>
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>Link</Label>
                            <Input
                              value={project.link}
                              onChange={(e) => handleProjectChange(project.id, "link", e.target.value)}
                              placeholder="https://github.com/yourrepo"
                            />
                          </div>
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={project.startDate}
                              onChange={(e) => handleProjectChange(project.id, "startDate", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2 field-card p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={project.endDate}
                              onChange={(e) => handleProjectChange(project.id, "endDate", e.target.value)}
                              disabled={project.current}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Description</Label>
                            <AIEnhanceButton
                              onEnhance={() =>
                                enhanceWithAI(
                                  "project",
                                  project.description,
                                  { id: project.id, projectName: project.name },
                                  (enhanced) => handleProjectChange(project.id, "description", enhanced)
                                )
                              }
                              isLoading={aiLoading[`project_${project.id}`]}
                              disabled={!project.description.trim()}
                            />
                          </div>
                          <Textarea
                            value={project.description}
                            onChange={(e) => handleProjectChange(project.id, "description", e.target.value)}
                            placeholder="Describe the project, technologies used, and key achievements..."
                            rows={4}
                            className="transition-shadow focus:shadow-lg"
                          />
                          {!project.description.trim() && project.name && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                generateWithAI(
                                  "project",
                                  { projectName: project.name, id: project.id },
                                  (generated) => handleProjectChange(project.id, "description", generated)
                                )
                              }
                              disabled={aiLoading[`generate_project_${project.id}`]}
                              className="w-full action-card"
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
        </div>
      </div>

      {showPreview && (
        <CVPreview cvData={cvData} onClose={handleClosePreview} theme={theme} />
      )}
    </>
  );
}
