"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FeatureShowcase } from "./FeatureShowcase";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const { login, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    }
  };

  return (
    <div className="flex min-h-screen">
      <FeatureShowcase />

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="relative bg-dark-card/20 backdrop-blur-sm rounded-2xl p-8 border border-white/5 shadow-glass overflow-hidden group transition-all duration-300 hover:shadow-glass-hover">
            <div className="absolute inset-0 bg-orange-gradient opacity-20 transition-opacity group-hover:opacity-30" />
            <div className="absolute inset-0 bg-glass-gradient" />
            <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-dark-gradient opacity-50" />

            <div className="relative">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-400">
                  Enter your credentials to access your account
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400"
                >
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Email"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                  placeholder="john@example.com"
                  disabled={authLoading}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    error={errors.password?.message}
                    disabled={authLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={authLoading}
                  className="w-full"
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="text-primary hover:text-primary-light transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
