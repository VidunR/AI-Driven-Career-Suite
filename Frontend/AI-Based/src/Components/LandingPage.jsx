import React from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ArrowRight,
  Users,
  FileText,
  MessageSquare,
  Star,
  Award,
  Target,
  ArrowUpWideNarrow,
  MoveUpRight,
} from "lucide-react";

export function LandingPage({ onLogin, onGetStarted }) {
  const features = [
    {
      icon: FileText,
      title: "AI CV Builder",
      description:
        "Create professional CVs with intelligent suggestions and industry-specific templates.",
    },
    {
      icon: Target,
      title: "Smart Job Search",
      description:
        "Find relevant opportunities with AI-powered matching based on your skills and preferences.",
    },
    {
      icon: MessageSquare,
      title: "Mock Interviews",
      description:
        "Practice with AI-powered interviews and get detailed feedback on your performance.",
    },
    {
      icon: Award,
      title: "Performance Analytics",
      description:
        "Track your progress and improvement across all career development activities.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Tech Corp",
      content:
        "AI Career Suite helped me land my dream job! The mock interviews were incredibly realistic.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager",
      company: "Innovation Labs",
      content:
        "The CV builder created a professional resume that got me noticed by top companies.",
      rating: 5,
    },
    {
      name: "Emily Johnson",
      role: "Marketing Specialist",
      company: "Growth Agency",
      content:
        "The job matching feature saved me hours of searching and found perfect opportunities.",
      rating: 5,
    },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* NAV */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="h-10 flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <img
                  src="/favicon_1.png"
                  alt="SkillSprint Logo"
                  className="w-8 h-8 object-cover rounded-md"
                />
              </div>
              <span className="ml-2 mt-1 text-xl font-bold">SkillSprint</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" type="button">
                  Login
                </Button>
              </Link>

              <Link to="/register">
                <Button type="button">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO — matches second screenshot */}
      <section className="relative overflow-hidden mt-10 md:mt-16">
        {/* subtle glow at the very top */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(91,91,214,0.45),transparent_60%)]" />
        </div>

        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-10 lg:gap-14">
            {/* LEFT copy */}
            <div>
              {/* Big two-line heading */}

              <h1 className="py-5 text-5xl font-bold mb-4 mt-4">
                Your AI Career <br />
                <span className="text-primary text-5xl font-bold">
                  Companion
                </span>
              </h1>

              <p className="text-xl text-muted-foreground">
                Build professional CVs, discover perfect job matches, and ace
                interviews with AI-powered feedback. Your complete career
                development platform.
              </p>

              {/* colored badges row */}
              <div className="py-4 flex items-center gap-3 flex-wrap mb-8">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-accent/10 text-accent border border-accent/20">
                  <FileText className="w-4 h-4" />
                  CV Builder
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                  <Target className="w-4 h-4" />
                  Smart Job Search
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-accent/10 text-accent border border-accent/20">
                  <MessageSquare className="w-4 h-4" />
                  Mock Interviews
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                  <MoveUpRight className="w-4 h-4" />
                  AI Feedback
                </span>
              </div>

              {/* buttons row */}
              <div className="py-4 flex items-center gap-4">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="px-6 py-3 font-semibold"
                    type="button"
                  >
                    Get Started Free
                  </Button>
                </Link>

                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-6 py-3"
                    type="button"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* RIGHT preview card */}
            <div className="relative">
              <Card className="bg-card/90 border-border shadow-xl rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground/90">
                      Dashboard Preview
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="w-3 h-3 rounded-full bg-secondary" />
                      <span className="w-3 h-3 rounded-full bg-accent" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* top bar */}
                  <div
                    aria-hidden
                    className="h-10 rounded-lg bg-primary/20 ring-1 ring-white/10 shadow-inner"
                  />

                  <div
                    aria-hidden
                    className="h-10 rounded-lg bg-primary/20 ring-1 ring-white/10 shadow-inner"
                  />

                  <div
                    aria-hidden
                    className="h-10 rounded-lg bg-primary/20 ring-1 ring-white/10 shadow-inner"
                  />

                  <div
                    aria-hidden
                    className="h-10 rounded-lg bg-primary/20 ring-1 ring-white/10 shadow-inner"
                  />
                </CardContent>
              </Card>

              {/* soft glow behind the card */}
              <div className="absolute -z-10 inset-0 blur-3xl bg-[radial-gradient(40%_50%_at_70%_50%,rgba(142,161,255,0.40),transparent_70%)]" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive tools powered by AI to accelerate your career
              journey
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border bg-background text-center"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Trusted by Professionals
            </h2>
            <p className="text-muted-foreground text-lg">
              See how AI Career Suite has helped others advance their careers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <Card key={index} className="border-border bg-card">
                <CardHeader>
                  <CardDescription className="text-foreground leading-relaxed">
                    “{t.content}”
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.role} at {t.company}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {/*<section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-12">
            Join thousands of professionals who have accelerated their careers
            with AI Career Suite.
          </p>
          <h1 className="text-primary">Hiii</h1>
          <Button
            size="lg"
            variant="secondary"
            onClick={onGetStarted}
            className="px-8 py-10"
          >
            Get Started Today
           
          </Button>
        </div>
      </section>*/}

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <img
                    src="/favicon_1.png"
                    alt="SkillSprint Logo"
                    className="w-8 h-8 object-cover rounded-md"
                  />
                </div>
                <span className="ml-2 text-lg font-semibold">SkillSprint</span>
              </div>
              <p className="py-3 mt-3 text-sm text-muted-foreground max-w-xs">
                Your AI-powered career <br />
                development platform
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="#"
                  >
                    CV Builder
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="#"
                  >
                    Job Search
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="#"
                  >
                    Mock Interviews
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="#"
                  >
                    Analytics
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="./About-Us"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="./Careers"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="./Contact"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="./Blog"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="#"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="#"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="#"
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} SkillSprint. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Security
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Settings
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}