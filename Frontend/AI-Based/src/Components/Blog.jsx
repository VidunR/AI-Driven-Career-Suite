import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import {
  ArrowLeft,
  Rocket,
  Calendar,
  Clock,
  Tag as TagIcon,
  Newspaper,
  ArrowRight,
} from "lucide-react";

const POSTS = [
  {
    id: "launch-ai-mock",
    title: "How We Built AI-Powered Mock Interviews",
    excerpt:
      "A behind-the-scenes look at our interview coach: data pipelines, LLM evaluation, and feedback loops.",
    date: "2025-08-12",
    readMins: 7,
    tag: "Engineering",
  },
  {
    id: "cv-tips",
    title: "CV Tips that Actually Matter in 2025",
    excerpt:
      "What hiring managers read first, and how to make your experience stand out with clarity.",
    date: "2025-07-28",
    readMins: 5,
    tag: "Career",
  },
  {
    id: "rag-job-matching",
    title: "RAG for Smart Job Matching",
    excerpt:
      "Using retrieval-augmented generation to match skills to roles while staying transparent.",
    date: "2025-07-05",
    readMins: 6,
    tag: "AI/ML",
  },
  {
    id: "portfolio-story",
    title: "Tell a Story with Your Portfolio",
    excerpt:
      "Go beyond screenshots—show impact, constraints, and what you learned.",
    date: "2025-06-20",
    readMins: 4,
    tag: "Design",
  },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Blog() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const tags = useMemo(
    () => ["all", ...Array.from(new Set(POSTS.map((p) => p.tag)))],
    []
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POSTS.filter((p) => {
      const matchesQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q);
      const matchesTag = filter === "all" || p.tag === filter;
      return matchesQ && matchesTag;
    });
  }, [query, filter]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Back button */}
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
            {/* Hero */}
            <div className="py-10 md:py-16">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                  <Rocket className="w-4 h-4" />
                  Insights & Updates
                </div>
              </div>

              <div className="max-w-3xl mx-auto text-center mt-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  SkillSprint <span className="text-primary">Blog</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Ideas on AI/ML, careers, and building better learning tools.
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="max-w-4xl mx-auto">
              <Card className="border-border">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Search posts…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="md:col-span-2"
                  />
                  <select
                    className="w-full h-10 rounded-md border border-border bg-background px-3 pr-8"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    {tags.map((t) => (
                      <option key={t} value={t}>
                        {t === "all" ? "All Topics" : t}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            </div>

            {/* Featured (first item) */}
            {visible.length > 0 && (
              <Card className="border-border bg-card mt-8">
                <CardContent className="p-6 md:p-8 grid md:grid-cols-5 gap-6">
                  <div className="md:col-span-2">
                    <div
                      aria-hidden
                      className="w-full h-40 md:h-full rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center"
                    >
                      <Newspaper className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <TagIcon className="w-3.5 h-3.5" /> {visible[0].tag}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(visible[0].date)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {visible[0].readMins}{" "}
                        min read
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold">
                      {visible[0].title}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {visible[0].excerpt}
                    </p>
                    <Button
                      variant="link"
                      className="p-0 mt-2 inline-flex items-center gap-1"
                    >
                      Read article <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Post grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {visible.slice(1).map((p) => (
                <Card key={p.id} className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <TagIcon className="w-3.5 h-3.5" /> {p.tag}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(p.date)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {p.readMins} min read
                      </span>
                    </div>
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {p.excerpt}
                    </CardDescription>
                    <Button
                      variant="link"
                      className="p-0 mt-2 inline-flex items-center gap-1"
                    >
                      Read article <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Subscribe */}
            <Card className="border-border bg-card mt-10">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                    <Rocket className="w-4 h-4" />
                    Stay in the loop
                  </div>
                  <h3 className="text-2xl font-semibold mt-3">
                    Subscribe to our newsletter
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Occasional emails about AI/ML features and career tips. No
                    spam.
                  </p>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                  <Input
                    placeholder="your@email.com"
                    className="w-full md:w-72"
                  />
                  <Button>Subscribe</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Blog;
