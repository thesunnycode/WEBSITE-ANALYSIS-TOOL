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
import { PasswordStrengthIndicator } from "@/components/ui/PasswordStrengthIndicator";
import { FeatureShowcase } from "./FeatureShowcase";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export function RegisterForm() {
  const { register: registerUser, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (values: FormData) => {
    try {
      setError(null);
      await registerUser(values.name, values.email, values.password);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
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
                  Create Account
                </h2>
                <p className="text-gray-400">
                  Join us and start analyzing websites
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
                  label="Full Name"
                  type="text"
                  {...register("name")}
                  error={errors.name?.message}
                  placeholder="John Doe"
                  disabled={authLoading}
                />

                <Input
                  label="Email"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                  placeholder="john@example.com"
                  disabled={authLoading}
                />

                <div className="space-y-4">
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
                  <PasswordStrengthIndicator password={password} />
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                  disabled={authLoading}
                />

                <Button
                  type="submit"
                  variant="primary"
                  loading={authLoading}
                  className="w-full"
                >
                  Create Account
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:text-primary-light transition-colors"
                  >
                    Sign in
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
