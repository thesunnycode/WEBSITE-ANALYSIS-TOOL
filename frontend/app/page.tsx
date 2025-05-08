import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Activity, Search, Shield, Accessibility, Clock, Brain, Star, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { AnimatedGradientBackground } from '@/components/ui/AnimatedGradientBackground';

export const metadata: Metadata = {
  title: 'Website Analysis Tool - Comprehensive Website Monitoring & Analysis',
  description: 'All-in-one tool to analyze performance, SEO, security, accessibility, and uptime with AI insights.',
};

export default function Home() {
  return (
    <AnimatedGradientBackground>
      {/* Hero Section */}
      <header className="relative w-full bg-gradient-to-b from-background to-background/80 pb-0">
        <div className="container mx-auto px-4 pt-16 pb-8">
          <nav className="flex items-center justify-between mb-12">
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <Image src="/globe.svg" alt="Logo" width={32} height={32} />
              Website Analysis
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="shadow-lg shadow-primary/30">Try Free</Button>
              </Link>
            </div>
          </nav>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary to-primary/80 text-xs font-semibold text-white rounded-full shadow">
                  <Brain className="w-4 h-4 mr-1" /> AI-powered
                </span>
              </div>
              <h1 className="text-5xl font-bold tracking-tight leading-tight">
                Complete Website Analysis
                <br />
                <span className="text-primary">In Minutes, Not Hours</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                All-in-one tool to analyze performance, SEO, security, accessibility, and uptime with AI insights.
              </p>
              <div className="flex space-x-4">
                <Link href="/signup">
                  <Button size="lg" className="shadow-xl shadow-primary/40 animate-pulse hover:scale-105 transition-transform">
                    Analyze Your Website Now
                  </Button>
                </Link>
              </div>
              {/* Trusted by bar */}
              <div className="mt-8 flex flex-col gap-2">
                <span className="text-xs text-muted-foreground mb-1">Trusted by teams at</span>
                <div className="flex items-center gap-6 opacity-80">
                  <Image src="/assets/nike.svg" alt="Nike" width={48} height={24} />
                  <Image src="/assets/visa.svg" alt="Visa" width={60} height={24} />
                  <Image src="/assets/mastercard.svg" alt="Mastercard" width={48} height={24} />
                  <Image src="/assets/google-drive.svg" alt="Google Drive" width={32} height={32} />
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              {/* Dashboard Illustration */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-background/80 animate-fade-in">
                <Image src="/window.svg" alt="Dashboard Preview" width={420} height={260} className="object-contain" />
              </div>
              {/* Animated gradient blob */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/40 to-secondary/30 rounded-full blur-2xl opacity-60 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Feature Highlights Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Optimize Your Website
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative bg-background p-6 rounded-xl shadow-lg border border-primary/10 transition-transform duration-200 hover:scale-105 hover:shadow-2xl group ${feature.badge ? 'ring-2 ring-primary/60' : ''}`}
              >
                <div className={`w-14 h-14 flex items-center justify-center mb-4 rounded-lg ${feature.bg}`}>{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  {feature.title}
                  {feature.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-white animate-bounce">{feature.badge}</span>
                  )}
                </h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <div className="text-sm text-primary font-medium">{feature.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center relative z-10">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/90 mb-4 shadow-lg">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-muted-foreground text-sm max-w-[180px]">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 right-[-48px] -translate-y-1/2 text-primary w-8 h-8 animate-bounce-x" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo/Preview Section */}
      <section className="py-20 bg-gradient-to-b from-background/90 to-background/70">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">See the Tool in Action</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-background/80 animate-fade-in">
              <Image src="/window.svg" alt="Demo Preview" width={420} height={260} className="object-contain" />
            </div>
            <div className="max-w-md text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Interactive Demo</h3>
              <p className="text-muted-foreground mb-4">Explore a sample dashboard and see real insights before you sign up.</p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Link href="/signup">
                  <Button size="sm" variant="secondary">Try with your website</Button>
                </Link>
                <Button size="sm" variant="outline">View sample report</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by Website Professionals</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-muted/80 rounded-xl p-6 shadow-lg max-w-xs flex flex-col items-center text-center border border-primary/10 animate-fade-in">
                <Image src={t.avatar} alt={t.name} width={64} height={64} className="rounded-full mb-3 border-2 border-primary/40" />
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-base mb-2">"{t.text}"</p>
                <div className="text-sm text-muted-foreground font-medium">- {t.name}, {t.role}</div>
              </div>
            ))}
          </div>
          {/* Brand logos */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-80">
            <Image src="/assets/nike.svg" alt="Nike" width={48} height={24} />
            <Image src="/assets/visa.svg" alt="Visa" width={60} height={24} />
            <Image src="/assets/mastercard.svg" alt="Mastercard" width={48} height={24} />
            <Image src="/assets/google-drive.svg" alt="Google Drive" width={32} height={32} />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Optimizing Your Website Today
          </h2>
          <p className="text-xl mb-8">
            Get comprehensive insights in minutes, not hours or days
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="shadow-xl shadow-white/20 hover:scale-105 transition-transform">
              Analyze Your Website For Free
            </Button>
          </Link>
          <p className="mt-4 text-sm">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Features</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Documentation</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            © 2024 Website Analysis Tool. All rights reserved.
      </div>
    </div>
      </footer>
    </AnimatedGradientBackground>
  );
}

const features = [
  {
    icon: <Activity className="w-8 h-8 text-blue-500 fill-blue-500" />, bg: 'bg-blue-100',
    title: 'Performance Analysis',
    description: 'Analyze load speed metrics and optimize your website performance',
    time: '2-3 min'
  },
  {
    icon: <Search className="w-8 h-8 text-orange-500 fill-orange-500" />, bg: 'bg-orange-100',
    title: 'SEO Audit',
    description: 'Check search engine optimization and improve your rankings',
    time: '3-4 min'
  },
  {
    icon: <Shield className="w-8 h-8 text-green-500 fill-green-500" />, bg: 'bg-green-100',
    title: 'Security Check',
    description: 'Scan for security vulnerabilities and protect your website',
    time: '4-5 min'
  },
  {
    icon: <Accessibility className="w-8 h-8 text-purple-500 fill-purple-500" />, bg: 'bg-purple-100',
    title: 'Accessibility Check',
    description: 'Evaluate WCAG compliance and make your site accessible',
    time: '2-3 min'
  },
  {
    icon: <Clock className="w-8 h-8 text-cyan-500 fill-cyan-500" />, bg: 'bg-cyan-100',
    title: 'Uptime Monitoring',
    description: 'Monitor site availability and get instant alerts',
    time: '1-2 min'
  },
  {
    icon: <Brain className="w-8 h-8 text-pink-500 fill-pink-500" />, bg: 'bg-pink-100',
    title: 'AI Insights',
    description: 'Get intelligent recommendations and analysis',
    time: 'Instant',
    badge: 'Recommended'
  }
];

const steps = [
  {
    icon: <Image src="/file.svg" alt="Step 1" width={32} height={32} />, title: 'Enter Website URL', description: 'Enter any website to analyze'
  },
  {
    icon: <Image src="/search.svg" alt="Step 2" width={32} height={32} />, title: 'Select Analysis Options', description: 'Choose which scans to run based on your needs'
  },
  {
    icon: <Image src="/window.svg" alt="Step 3" width={32} height={32} />, title: 'View Results', description: 'Comprehensive dashboard with visual reports'
  },
  {
    icon: <Brain className="w-8 h-8 text-pink-500 fill-pink-500" />, title: 'Get AI Insights', description: 'Receive actionable recommendations'
  }
];

const testimonials = [
  {
    avatar: '/assets/placeholder-avatar.svg',
    name: 'Sarah T.',
    role: 'Ecommerce Manager',
    text: 'Identified critical SEO issues we had completely missed.'
  },
  {
    avatar: '/assets/placeholder-avatar.svg',
    name: 'Michael R.',
    role: 'SaaS Founder',
    text: 'The uptime monitoring alerted us to problems before our customers noticed.'
  },
  {
    avatar: '/assets/placeholder-avatar.svg',
    name: 'Jamie L.',
    role: 'Agency Owner',
    text: 'AI insights helped us improve page speed by 65% in just one week.'
  }
];