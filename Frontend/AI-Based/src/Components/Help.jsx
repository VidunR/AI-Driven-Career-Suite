import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, MessageCircle, BookOpen, Video, FileText, 
  Mail, Send, ExternalLink, ChevronDown, ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';

export function Help({ user, accessToken, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqItems = [
    {
      id: 'getting-started',
      question: 'How do I get started with mock interviews?',
      answer: 'To begin your mock interview journey, navigate to the "Mock Interview" section and click "Start New Interview". Choose your target position, interview type, and difficulty level. Our AI will generate personalized questions based on your selections.'
    },
    {
      id: 'cv-builder',
      question: 'How do I create and edit my CV?',
      answer: 'Go to the CV Manager section and click "Create New CV" or edit an existing one. Our CV builder includes sections for personal information, work experience, education, skills, and projects. You can save multiple versions for different job applications.'
    },
    {
      id: 'interview-types',
      question: 'What types of interviews are available?',
      answer: 'We offer four types of mock interviews: Behavioral (situational questions), Technical (coding and technical concepts), Case Study (business problem-solving), and Mixed (combination of all types). Choose based on your target role and preparation needs.'
    },
    {
      id: 'scoring',
      question: 'How is my interview performance scored?',
      answer: 'Our AI evaluates your responses based on multiple criteria including communication clarity, technical accuracy, problem-solving approach, and leadership qualities. Scores range from 0-100% with detailed feedback for improvement.'
    },
    {
      id: 'job-search',
      question: 'How does the job search feature work?',
      answer: 'Our job search aggregates opportunities from multiple sources. Use filters for location, job type, experience level, and skills. Save interesting positions and track your applications all in one place.'
    },
    {
      id: 'privacy',
      question: 'Is my interview data private and secure?',
      answer: 'Yes, we take privacy seriously. Your interview recordings and responses are encrypted and stored securely. You can control your privacy settings and delete your data at any time. We never share personal information without consent.'
    }
  ];

  const tutorials = [
    {
      title: 'Getting Started with AI Career Suite',
      duration: '5 min',
      description: 'Learn the basics of navigating the platform and setting up your profile.',
      type: 'video'
    },
    {
      title: 'Mastering Mock Interviews',
      duration: '10 min',
      description: 'Best practices for conducting effective mock interviews and using feedback.',
      type: 'video'
    },
    {
      title: 'Building a Winning CV',
      duration: '8 min',
      description: 'Step-by-step guide to creating professional CVs that get noticed.',
      type: 'guide'
    },
    {
      title: 'Job Search Strategies',
      duration: '12 min',
      description: 'How to effectively use our job search tools to find your ideal position.',
      type: 'guide'
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = () => {
    toast.success('Your message has been sent. We\'ll respond within 24 hours.');
    setContactForm({ subject: '', message: '', priority: 'medium' });
  };

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers, tutorials, and get support for AI Career Suite
        </p>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Items */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFAQ.map((item) => (
                  <div key={item.id} className="border rounded-lg">
                    <button
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
                      onClick={() => toggleFAQ(item.id)}
                    >
                      <span className="font-medium">{item.question}</span>
                      {expandedFAQ === item.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedFAQ === item.id && (
                      <div className="p-4 pt-0 text-muted-foreground">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {filteredFAQ.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No matching questions found.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try different keywords or contact support for help.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{tutorial.title}</h3>
                        <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {tutorial.type === 'video' ? (
                          <Video className="h-5 w-5 text-primary" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{tutorial.duration}</span>
                      <Button size="sm" variant="outline">
                        {tutorial.type === 'video' ? 'Watch' : 'Read'}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue or question in detail..."
                    rows={5}
                  />
                </div>
                <Button onClick={handleContactSubmit} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Other ways to reach us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">support@aicareersuite.com</p>
                      <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-muted-foreground">Available 9 AM - 6 PM EST</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Documentation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive guides and API documentation
                </p>
                <Button variant="outline" size="sm">
                  View Docs
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Video Library</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Step-by-step video tutorials and webinars
                </p>
                <Button variant="outline" size="sm">
                  Watch Videos
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join discussions with other users
                </p>
                <Button variant="outline" size="sm">
                  Join Community
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Interview Engine</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>CV Builder</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Job Search</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
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