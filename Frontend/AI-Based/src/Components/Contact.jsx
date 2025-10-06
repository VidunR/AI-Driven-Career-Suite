import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Briefcase,
  Megaphone,
  Send,
} from "lucide-react";

export function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    setIsSending(true);
    // simulate send
    setTimeout(() => {
      setIsSending(false);
      toast.success("Thanks! Your message has been sent.");
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 700);
  };

  const quickContacts = [
    {
      icon: Mail,
      title: "Email Support",
      desc: "skillsprint.official@outlook.com",
      href: "mailto:support@skillsprint.app",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
                  Get in touch
                </div>
              </div>

              <div className="max-w-3xl mx-auto text-center mt-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Contact <span className="text-primary">SkillSprint</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Questions, feedback, or ideas? We’d love to hear from you.
                </p>
              </div>
            </div>

            {/* Top cards */}
            <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {quickContacts.map(({ icon: Icon, title, desc, href }) => (
                <Card key={title} className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="mt-3 font-semibold">{title}</div>
                    <a
                      href={href}
                      className="text-sm text-primary hover:underline"
                    >
                      {desc}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Form + Info */}
            <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto mt-8">
              {/* Form */}
              <Card className="lg:col-span-3 border-border bg-card">
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    We typically reply within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Full name
                        </label>
                        <Input
                          name="name"
                          placeholder="Your name"
                          value={form.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Email
                        </label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Subject (optional)
                      </label>
                      <Input
                        name="subject"
                        placeholder="How can we help?"
                        value={form.subject}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Message
                      </label>
                      <textarea
                        name="message"
                        rows={6}
                        placeholder="Write your message..."
                        value={form.message}
                        onChange={handleChange}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSending}
                      className="inline-flex items-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Info */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-border bg-card">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-semibold">Headquarters</div>
                        <div className="text-sm text-muted-foreground">
                          Colombo, Sri Lanka (Remote-first team)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-semibold">Support Hours</div>
                        <div className="text-sm text-muted-foreground">
                          Mon–Fri, 9am–6pm IST
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-semibold">Phone</div>
                        <div className="text-sm text-muted-foreground">
                          +94 (000) 000 000
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-semibold">Community</div>
                        <div className="text-sm text-muted-foreground">
                          Join our Discord to meet other learners and get quick
                          help.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Contact;
