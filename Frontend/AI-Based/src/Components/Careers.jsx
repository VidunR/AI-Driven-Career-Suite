import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  ChevronDown,
  ChevronUp,
  Tag,
  Rocket,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   INTERNAL OPEN ROLES (your own jobs)
   Add/remove roles here as needed
────────────────────────────────────────────────────────────── */
const JOBS = [
  {
    id: "aiml-1",
    title: "AI/ML Engineer",
    department: "AI/ML",
    location: "Remote (LKA / Global)",
    type: "Full-time",
    level: "Mid–Senior",
    postedAt: "2025-08-29",
    tags: ["Python", "PyTorch", "LLMs", "RAG", "Vector DB", "MLOps"],
    summary:
      "Build and productionize LLM/RAG systems for interview feedback and smart job matching at SkillSprint.",
    responsibilities: [
      "Prototype, evaluate, and ship LLM/RAG pipelines for interview coaching and matching",
      "Design clean data flows for prompt tuning, evaluation, and offline experimentation",
      "Optimize inference cost/latency; productionize with robust observability",
      "Collaborate with product/design to deliver measurable learner outcomes",
    ],
    requirements: [
      "2+ years hands-on ML/DS experience (LLM or NLP preferred)",
      "Strong Python; PyTorch or TensorFlow proficiency",
      "Experience with RAG, vector databases (FAISS/Pinecone, etc.)",
      "Prompt engineering or LLM fine-tuning exposure",
      "MLOps tools (Weights & Biases/MLflow), Docker; Cloud (AWS/GCP/Vercel)",
    ],
  },
];

/* Utilities */
function daysAgo(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.max(0, Math.round((now - d) / (1000 * 60 * 60 * 24)));
  return diff === 0 ? "Today" : `${diff} day${diff > 1 ? "s" : ""} ago`;
}

export function Careers() {
  const navigate = useNavigate();

  /* Filters */
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");

  /* Details expander */
  const [openId, setOpenId] = useState(null);

  /* Options */
  const departments = useMemo(
    () => ["all", ...Array.from(new Set(JOBS.map((j) => j.department)))],
    []
  );
  const locations = useMemo(
    () => ["all", ...Array.from(new Set(JOBS.map((j) => j.location)))],
    []
  );
  const types = useMemo(
    () => ["all", ...Array.from(new Set(JOBS.map((j) => j.type)))],
    []
  );

  /* Filtering */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return JOBS.filter((j) => {
      const matchesQuery =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.summary.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q)) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q);
      const matchesDept = department === "all" || j.department === department;
      const matchesLoc = location === "all" || j.location === location;
      const matchesType = type === "all" || j.type === type;
      return matchesQuery && matchesDept && matchesLoc && matchesType;
    });
  }, [search, department, location, type]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Back button (same placement as About/Login) */}
      <div className="p-4">
        <Link to="/landing-page">
          <Button
            variant="ghost"
            size="sm"
            className="inline-flex items-center gap-2 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <main className="flex-1">
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* ===== HERO (centered like AboutUs) ===== */}
            <div className="py-10 md:py-16">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                  <Rocket className="w-4 h-4" />
                  We’re Hiring
                </div>
              </div>

              <div className="max-w-3xl mx-auto text-center mt-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Careers at <span className="text-primary">SkillSprint</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-2">
                  Join us to build the AI career platform learners will love.
                </p>
              </div>
            </div>
            {/* ===== /HERO ===== */}

            {/* Filters — fixed layout so all labels are fully visible */}
            <div className="max-w-4xl mx-auto">
              <Card className="border-border">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                  <Input
                    placeholder="Search roles, skills, or keywords…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="md:col-span-2"
                  />

                  <select
                    className="w-full h-10 rounded-md border border-border bg-background px-3 pr-8"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d === "all" ? "All Departments" : d}
                      </option>
                    ))}
                  </select>

                  <select
                    className="w-full h-10 rounded-md border border-border bg-background px-3 pr-8"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    {locations.map((l) => (
                      <option key={l} value={l}>
                        {l === "all" ? "All Locations" : l}
                      </option>
                    ))}
                  </select>

                  <select
                    className="w-full h-10 rounded-md border border-border bg-background px-3 pr-8"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {t === "all" ? "All Types" : t}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            </div>

            {/* Roles */}
            <div className="mt-8 space-y-4 max-w-7xl mx-auto">
              {filtered.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No roles match your filters right now.
                  </CardContent>
                </Card>
              )}

              {filtered.map((job) => {
                const isOpen = openId === job.id;
                return (
                  <Card key={job.id} className="border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription>{job.summary}</CardDescription>

                          <div className="flex flex-wrap gap-2 pt-2">
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Briefcase className="w-3.5 h-3.5" />{" "}
                              {job.department}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <MapPin className="w-3.5 h-3.5" /> {job.location}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Clock className="w-3.5 h-3.5" /> {job.type} ·{" "}
                              {job.level}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Clock className="w-3.5 h-3.5" /> Posted{" "}
                              {daysAgo(job.postedAt)}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {job.tags.map((t) => (
                              <Badge
                                key={t}
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                <Tag className="w-3.5 h-3.5" /> {t}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Button
                            onClick={() => navigate(`/careers/apply/${job.id}`)}
                            className="min-w-[130px]"
                          >
                            Apply Now
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setOpenId(isOpen ? null : job.id)}
                            className="min-w-[130px]"
                          >
                            {isOpen ? (
                              <>
                                Hide Details{" "}
                                <ChevronUp className="w-4 h-4 ml-1" />
                              </>
                            ) : (
                              <>
                                View Details{" "}
                                <ChevronDown className="w-4 h-4 ml-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {isOpen && (
                      <CardContent className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-2">
                            Responsibilities
                          </h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {job.responsibilities.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Requirements</h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {job.requirements.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Careers;
