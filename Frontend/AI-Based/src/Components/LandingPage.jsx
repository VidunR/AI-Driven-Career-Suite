import React from 'react';
import { Button } from './UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './UI/card';
import { ArrowRight, Users, FileText, MessageSquare, Star, Award, Target } from 'lucide-react';

export function LandingPage({ onLogin, onGetStarted }) {
  const features = [
    {
      icon: FileText,
      title: 'AI-Powered CV Builder',
      description: 'Create professional CVs with AI assistance and industry-specific templates.'
    },
    {
      icon: Target,
      title: 'Smart Job Matching',
      description: 'Find the perfect job opportunities that match your skills and experience.'
    },
    {
      icon: MessageSquare,
      title: 'Mock Interviews',
      description: 'Practice with AI-powered mock interviews tailored to your target roles.'
    },
    {
      icon: Award,
      title: 'Performance Tracking',
      description: 'Track your progress and improve your interview skills with detailed analytics.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      company: 'Tech Corp',
      content: 'AI Career Suite helped me land my dream job! The mock interviews were incredibly realistic.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Product Manager',
      company: 'Innovation Labs',
      content: 'The CV builder created a professional resume that got me noticed by top companies.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Marketing Specialist',
      company: 'Growth Agency',
      content: 'The job matching feature saved me hours of searching and found perfect opportunities.',
      rating: 5
    }
  ];

  return (
    
    <div className="bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="ml-2 text-xl font-bold">AI Career Suite</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onLogin}>
                Sign In
              </Button>
              <Button onClick={onGetStarted}>
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Accelerate Your Career with{' '}
            <span className="text-primary">AI-Powered</span> Tools
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Build professional CVs, discover perfect job matches, and ace interviews with our comprehensive AI career platform designed for students and professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted} className="px-8 py-3">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={onLogin} className="px-8 py-3">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our comprehensive suite of AI-powered tools helps you at every step of your career journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border bg-background">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
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

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-muted-foreground text-lg">
              See what our users are saying about their career transformation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <CardDescription className="text-foreground leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8">
            Join thousands of professionals who have accelerated their careers with AI Career Suite.
          </p>
          <Button size="lg" variant="secondary" onClick={onGetStarted} className="px-8 py-3">
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="ml-2 text-xl font-bold">AI Career Suite</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 AI Career Suite. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}