import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  ArrowLeft,
  Building,
  Users,
  Target,
  Rocket,
  Shield,
  Sparkles,
  Globe,
  Trophy,
  LineChart,
  Code,
  CheckCircle2,
} from "lucide-react";

function AboutUs({ onBack }) {
  const stats = [
    { label: "Users", value: "50k+", icon: Users },
    { label: "Mock Interviews", value: "120k+", icon: Trophy },
    { label: "Job Matches", value: "2.3k+", icon: LineChart },
    { label: "Companies", value: "1.2k+", icon: Building },
  ];

  const values = [
    {
      icon: Target,
      title: "Student-First",
      desc: "Every decision starts with the learner’s outcome.",
    },
    {
      icon: Shield,
      title: "Trust & Privacy",
      desc: "Your data is protected and always in your control.",
    },
    {
      icon: Sparkles,
      title: "Craftsmanship",
      desc: "We sweat the details to make complex feel simple.",
    },
    {
      icon: Code,
      title: "Open Tech",
      desc: "Interoperable building blocks with modern tooling.",
    },
    {
      icon: LineChart,
      title: "Outcome-Driven",
      desc: "Real improvement in skills, confidence, and offers.",
    },
    {
      icon: Globe,
      title: "Access for All",
      desc: "Great career prep should be available to everyone.",
    },
  ];

  const team = [
    {
      name: "Luchintha Anjana",
      role: "Team Lead, Head of Backend & AI/ML",
      photo: "/team/luchintha.jpg",
    },
    {
      name: "Vethiya Wijegunawardana",
      role: "AI/ML and Backend Developer",
      photo: "/team/vethiya-wijegunawardana.jpg",
    },
    {
      name: "Rivith Ranaweera",
      role: "BackEnd Developer & UI/UX Designer",
      photo: "/team/rivith1.jpg",
    },
    {
      name: "Savin Senevirathne",
      role: "Frontend Developer and QA Tester",
      photo: "/team/savin.jpg",
    },
    {
      name: "Vidun Rashmika",
      role: "FrontEnd Developer & UI/UX Designer",
      photo: "/team/vidun.jpg",
    },
  ];

  // Center the bottom row on md (3-across -> 3/2 pyramid)
  const placeClass = (idx) => {
    if (idx === 3) return "md:col-start-1 lg:col-start-auto";
    if (idx === 4) return "md:col-start-3 lg:col-start-auto";
    return "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Back button (top-left) */}
      <div className="p-4">
        <Link to="/landing-page">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
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
            {/* ===== HERO ===== */}
            <div className="py-10 md:py-16">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                  <Rocket className="w-4 h-4" />
                  Our Mission
                </div>
              </div>

              <div className="max-w-3xl mx-auto text-center mt-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  About <span className="text-primary">SkillSprint</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  We empower students and early professionals to land their
                  dream roles through AI-driven practice, personalized guidance,
                  and curated opportunities.
                </p>
              </div>

              {/* Stats */}
              <div className="mt-8 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {stats.map(({ label, value, icon: Icon }) => (
                  <Card key={label} className="border-border bg-card">
                    <CardContent className="p-5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {label}
                        </span>
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-semibold mt-1">{value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {/* ===== /HERO ===== */}

            {/* VALUES */}
            <section className="py-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">Our Values</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-3">
                  Principles that shape how we build and support our learners
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {values.map(({ icon: Icon, title, desc }) => (
                  <Card key={title} className="border-border bg-background">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="mt-4 text-lg font-semibold">{title}</div>
                      <p className="text-muted-foreground mt-2">{desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* TEAM */}
            <section className="py-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">Team</h3>
              </div>

              <Card className="border-border bg-card">
                {/* wider side padding + much larger horizontal gaps */}
                <CardContent className="p-6 md:px-10 lg:px-12">
                  <div
                    className="
                      grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5
                      gap-y-16 md:gap-y-20
                      gap-x-8 sm:gap-x-12 md:gap-x-16 lg:gap-x-20 xl:gap-x-24 2xl:gap-x-28
                    "
                  >
                    {team.map((m, idx) => (
                      <div
                        key={m.name}
                        className={`text-center justify-self-center mb-4 ${placeClass(
                          idx
                        )}`}
                      >
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-background border border-border mx-auto">
                          <img
                            src={m.photo}
                            alt={m.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/Favicon.png";
                            }}
                          />
                        </div>
                        <div className="mt-3 font-semibold">{m.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {m.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* CTA */}
            <section className="py-12">
              <Card className="border-border bg-card">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-accent/10 text-accent border border-accent/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Ready to level up?
                    </div>
                    <h3 className="text-2xl font-semibold mt-2">
                      Join our mission to make career growth more accessible.
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                      Practice interviews, polish your portfolio, and explore
                      roles with clarity and confidence.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link to="/register">
                      <Button className="px-6">Get Started</Button>
                    </Link>
                    <Link to="/contact">
                      <Button variant="outline" className="px-6">
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutUs;
export { AboutUs };
