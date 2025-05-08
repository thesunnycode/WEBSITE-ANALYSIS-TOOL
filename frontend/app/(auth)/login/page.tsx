"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { AnimatedGradientBackground } from "@/components/ui/AnimatedGradientBackground";

const welcomeWords = [
  "Welcome back",
  "Glad to see you",
  "Hello again",
  "Welcome home",
];

const testimonials = [
  {
    avatar: "/assets/placeholder-avatar.svg",
    name: "Sarah T.",
    role: "Ecommerce Manager",
    text: "Identified critical SEO issues we had completely missed.",
  },
  {
    avatar: "/assets/placeholder-avatar.svg",
    name: "Michael R.",
    role: "SaaS Founder",
    text: "The uptime monitoring alerted us to problems before our customers noticed.",
  },
  {
    avatar: "/assets/placeholder-avatar.svg",
    name: "Jamie L.",
    role: "Agency Owner",
    text: "AI insights helped us improve page speed by 65% in just one week.",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setWelcomeIndex((prev) => (prev + 1) % welcomeWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatedGradientBackground>
      <div className="relative grid lg:grid-cols-[1.1fr,0.9fr] h-screen">
        {/* Left Side - Features & Testimonials */}
        <div className="hidden lg:flex flex-col justify-center px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-3xl space-y-10"
          >
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={welcomeIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}
                  className="text-7xl font-bold text-white"
                >
                  {welcomeWords[welcomeIndex]}
                </motion.div>
              </AnimatePresence>
              <div className="space-y-4">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-semibold text-white/90"
                >
                  Monitor your website performance
                  <br />
                  <br />
                  and security in real-time
                  <br />
                  <br />
                  with WebAnalyzer
                </motion.h2>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="max-w-2xl space-y-4"
            >
              <p className="text-xl text-white/80 leading-relaxed">
                Get detailed insights, track performance metrics, and ensure
                your website is running at its best.
              </p>
              <p className="text-xl text-white/80 leading-relaxed">
                Join thousands of developers who trust WebAnalyzer for their web
                monitoring needs.
              </p>
            </motion.div>
            {/* Testimonial carousel (desktop) */}
            <div className="mt-12">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-muted/80 rounded-xl p-6 shadow-lg max-w-xs flex flex-col items-center text-center border border-primary/10 animate-fade-in"
              >
                <Image
                  src={testimonials[testimonialIndex].avatar}
                  alt={testimonials[testimonialIndex].name}
                  width={64}
                  height={64}
                  className="rounded-full mb-3 border-2 border-primary/40"
                />
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, idx) => (
                    <svg
                      key={idx}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.9 4.8,17.8 9.9,14.7 15,17.8 13.8,11.9 18.2,7.6 12.2,6.6 " />
                    </svg>
                  ))}
                </div>
                <p className="text-base mb-2">
                  "{testimonials[testimonialIndex].text}"
                </p>
                <div className="text-sm text-muted-foreground font-medium">
                  - {testimonials[testimonialIndex].name},{" "}
                  {testimonials[testimonialIndex].role}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        {/* Right Side - Login Form */}
        <div className="w-full flex flex-col items-center justify-center p-6">
          {/* Logo and AI badge */}
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/globe.svg"
              alt="Logo"
              width={40}
              height={40}
              className="mb-2"
            />
            <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary to-primary/80 text-xs font-semibold text-white rounded-full shadow mb-2">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <circle cx="12" cy="12" r="5" />
              </svg>
              AI-powered
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 space-y-6 bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl shadow-primary/20">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-white">Sign In</h1>
                <p className="text-white/60">
                  Enter your credentials to access your account
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-white/80"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 transition-colors duration-300"
                  />
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-white/80"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 transition-colors duration-300"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary/60 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </motion.div>
              </form>
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </motion.div>
            </Card>
            {/* Trusted by bar */}
            <div className="mt-8 flex flex-col gap-2 items-center">
              <span className="text-xs text-muted-foreground mb-1">
                Trusted by teams at
              </span>
              <div className="flex items-center gap-6 opacity-80">
                <Image
                  src="/assets/nike.svg"
                  alt="Nike"
                  width={48}
                  height={24}
                />
                <Image
                  src="/assets/visa.svg"
                  alt="Visa"
                  width={60}
                  height={24}
                />
                <Image
                  src="/assets/mastercard.svg"
                  alt="Mastercard"
                  width={48}
                  height={24}
                />
                <Image
                  src="/assets/google-drive.svg"
                  alt="Google Drive"
                  width={32}
                  height={32}
                />
              </div>
            </div>
            {/* Testimonial carousel (mobile) */}
            <div className="mt-8 block lg:hidden">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-muted/80 rounded-xl p-6 shadow-lg max-w-xs flex flex-col items-center text-center border border-primary/10 animate-fade-in mx-auto"
              >
                <Image
                  src={testimonials[testimonialIndex].avatar}
                  alt={testimonials[testimonialIndex].name}
                  width={64}
                  height={64}
                  className="rounded-full mb-3 border-2 border-primary/40"
                />
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, idx) => (
                    <svg
                      key={idx}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.9 4.8,17.8 9.9,14.7 15,17.8 13.8,11.9 18.2,7.6 12.2,6.6 " />
                    </svg>
                  ))}
                </div>
                <p className="text-base mb-2">
                  "{testimonials[testimonialIndex].text}"
                </p>
                <div className="text-sm text-muted-foreground font-medium">
                  - {testimonials[testimonialIndex].name},{" "}
                  {testimonials[testimonialIndex].role}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatedGradientBackground>
  );
}
