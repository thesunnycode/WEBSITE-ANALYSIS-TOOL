"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowingStarsBackgroundCard } from "@/components/ui/glowing-stars";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

const formSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const token = window.location.pathname.split("/").pop() || "";
      await resetPassword(token, values.password);
      setSuccess(true);
      toast.success("Password reset successful!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlowingStarsBackgroundCard>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <SpotlightCard>
            <GlassCard className="p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Reset Password
                  </h1>
                  <p className="text-white/60">Enter your new password below</p>
                </div>

                {success ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="alert alert-success text-green-400 bg-green-400/10 p-4 rounded-lg border border-green-400/20">
                      Password reset successful!
                    </div>
                    <Link
                      href="/login"
                      className="btn btn-primary w-full inline-block bg-primary hover:bg-primary-light text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Input
                          type="password"
                          placeholder="New Password"
                          {...register("password")}
                          error={errors.password?.message}
                        />
                      </div>
                      <div>
                        <Input
                          type="password"
                          placeholder="Confirm Password"
                          {...register("confirmPassword")}
                          error={errors.confirmPassword?.message}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Resetting Password..." : "Reset Password"}
                    </Button>
                  </form>
                )}
              </motion.div>
            </GlassCard>
          </SpotlightCard>
        </div>
      </div>
    </GlowingStarsBackgroundCard>
  );
}
