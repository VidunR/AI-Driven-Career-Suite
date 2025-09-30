import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, MessageCircle, BookOpen, Video, FileText, Mail, Send, ExternalLink, ChevronDown, ChevronRight, Sparkles, HelpCircle, Zap, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export function Help({ user, accessToken, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [sending, setSending] = useState(false);

  const faqItems = [
    { id: 'getting-started', question: 'How do I get started with mock interviews?', answer: 'To begin your mock interview journey, navigate to the "Mock Interview" section and click "Start New Interview". Choose your target position, interview type, and difficulty level. Our AI will generate personalized questions based on your selections.' },
    { id: 'cv-builder', question: 'How do I create and edit my CV?', answer: 'Go to the CV Manager section and click "Create New CV" or edit an existing one. Our CV builder includes sections for personal information, work experience, education, skills, and projects. You can save multiple versions for different job applications.' },
    { id: 'interview-types', question: 'What types of interviews are available?', answer: 'We offer four types of mock interviews: Behavioral (situational questions), Technical (coding and technical concepts), Case Study (business problem-solving), and Mixed (combination of all types). Choose based on your target role and preparation needs.' },
    { id: 'scoring', question: 'How is my interview performance scored?', answer: 'Our AI evaluates your responses based on multiple criteria including communication clarity, technical accuracy, problem-solving approach, and leadership qualities. Scores range from 0-100% with detailed feedback for improvement.' },
    { id: 'job-search', question: 'How does the job search feature work?', answer: 'Our job search aggregates opportunities from multiple sources. Use filters for location, job type, experience level, and skills. Save interesting positions and track your applications all in one place.' },
    { id: 'privacy', question: 'Is my interview data private and secure?', answer: 'Yes, we take privacy seriously. Your interview recordings and responses are encrypted and stored securely. You can control your privacy settings and delete your data at any time. We never share personal information without consent.' }
  ];

  const tutorials = [
    { title: 'Getting Started with AI Career Suite', duration: '5 min', description: 'Learn the basics of navigating the platform and setting up your profile.', type: 'video' },
    { title: 'Mastering Mock Interviews', duration: '10 min', description: 'Best practices for conducting effective mock interviews and using feedback.', type: 'video' },
    { title: 'Building a Winning CV', duration: '8 min', description: 'Step-by-step guide to creating professional CVs that get noticed.', type: 'guide' },
    { title: 'Job Search Strategies', duration: '12 min', description: 'How to effectively use our job search tools to find your ideal position.', type: 'guide' }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id) => setExpandedFAQ(expandedFAQ === id ? null : id);

  const handleContactSubmit = async () => {
    const subject = contactForm.subject.trim();
    const message = contactForm.message.trim();
    if (!subject || !message) {
      toast.error('Please enter both subject and message.');
      return;
    }
    try {
      setSending(true);
      const templateParams = {
        subject,
        message,
        priority: (contactForm.priority || 'medium').toUpperCase(),
        name: user?.fullName || user?.name || 'SkillSprint User',
        from_email: user?.email || 'no-reply@skillsprint.app',
      };
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, { publicKey: EMAILJS_PUBLIC_KEY });
      toast.success("Your message has been sent. We'll respond within 24 hours.");
      setContactForm({ subject: '', message: '', priority: 'medium' });
    } catch (err) {
      console.error('Email send error:', err);
      const detail = err?.text || err?.message || 'Failed to send message. Please try again.';
      toast.error(detail);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInFromTop { from { opacity: 0; transform: translateY(-1rem); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInFromBottom { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slide-in-top { animation: slideInFromTop 0.6s ease-out forwards; }
        .animate-slide-in-bottom { animation: slideInFromBottom 0.6s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.5s ease-out forwards; }
        .opacity-0 { opacity: 0; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .faq-card { transition: all 0.3s ease; }
        .faq-card:hover { background-color: rgba(0, 0, 0, 0.02); }
        .tutorial-card { transition: all 0.3s ease; }
        .tutorial-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
      `}</style>

      <div className="text-center space-y-2 opacity-0 animate-slide-in-top">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Help & Support</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Find answers, tutorials, and get support for SkillSprint
        </p>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 opacity-0 animate-slide-in-top delay-100">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          <Card className="border-border opacity-0 animate-scale-in delay-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-sm shadow-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border opacity-0 animate-scale-in delay-300 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredFAQ.map((item, index) => (
                  <div key={item.id} className="border rounded-lg overflow-hidden faq-card" style={{ animationDelay: `${0.4 + index * 0.05}s` }}>
                    <button
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-300"
                      onClick={() => toggleFAQ(item.id)}
                    >
                      <span className="font-medium text-sm pr-4">{item.question}</span>
                      {expandedFAQ === item.id ? (
                        <ChevronDown className="h-4 w-4 text-primary flex-shrink-0 transition-transform duration-300" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-300" />
                      )}
                    </button>
                    {expandedFAQ === item.id && (
                      <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed animate-slide-in-bottom">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQ.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-base font-medium mb-1">No matching questions found</p>
                  <p className="text-xs text-muted-foreground">
                    Try different keywords or contact support for help.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className={`tutorial-card cursor-pointer opacity-0 animate-scale-in border-border hover:shadow-xl`} style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 flex-1">
                        <h3 className="font-bold text-base">{tutorial.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{tutorial.description}</p>
                      </div>
                      <div className="ml-3">
                        {tutorial.type === 'video' ? (
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Video className="h-5 w-5 text-blue-500" />
                          </div>
                        ) : (
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <FileText className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t">
                      <span className="text-xs font-medium text-muted-foreground">{tutorial.duration}</span>
                      <Button size="sm" variant="outline" className="hover:bg-primary hover:text-white transition-all duration-300 h-8 text-xs">
                        {tutorial.type === 'video' ? 'Watch' : 'Read'}
                        <ExternalLink className="h-3 w-3 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border opacity-0 animate-scale-in delay-200 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Send us a message
                </CardTitle>
                <CardDescription className="text-xs">We typically respond within 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-sm">Subject</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm">Message</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue or question in detail..."
                    rows={5}
                    className="resize-none text-sm"
                  />
                </div>
                <Button onClick={handleContactSubmit} className="w-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-9" disabled={sending}>
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border opacity-0 animate-scale-in delay-300 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Other ways to reach us
                </CardTitle>
                <CardDescription className="text-xs">Choose your preferred contact method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Email Support</p>
                      <p className="text-xs text-primary mt-0.5">skillsprint.official@outlook.com</p>
                      <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-border opacity-0 animate-scale-in delay-200 hover:shadow-xl transition-all duration-500 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-bold text-base mb-1.5">Documentation</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Comprehensive guides and API documentation
                </p>
                <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-all duration-300 h-8 text-xs">
                  View Docs
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border opacity-0 animate-scale-in delay-300 hover:shadow-xl transition-all duration-500 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Video className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-bold text-base mb-1.5">Video Library</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Step-by-step video tutorials and webinars
                </p>
                <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-all duration-300 h-8 text-xs">
                  Watch Videos
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border opacity-0 animate-scale-in delay-400 hover:shadow-xl transition-all duration-500 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-bold text-base mb-1.5">Community</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Join discussions with other users
                </p>
                <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-all duration-300 h-8 text-xs">
                  Join Community
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border opacity-0 animate-scale-in delay-500 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                System Status
              </CardTitle>
              <CardDescription className="text-xs">All systems operational</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
                  <span className="font-medium text-sm">Interview Engine</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
                  <span className="font-medium text-sm">CV Builder</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
                  <span className="font-medium text-sm">Job Search</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-green-600">Operational</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}