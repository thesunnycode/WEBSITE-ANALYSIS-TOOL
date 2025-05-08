'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type FormData = z.infer<typeof formSchema>

export default function ForgotPassword() {
  const { resetPassword, loading } = useAuth()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (values: FormData) => {
    try {
      setError(null)
      await resetPassword(values.email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card bg-white/10 shadow-2xl backdrop-blur-lg p-8 border border-white/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Reset Password
            </h2>
            <p className="text-white/80">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="bg-green-500/20 text-white p-4 rounded-lg mb-6">
                Check your email for password reset instructions
              </div>
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 hover:underline"
              >
                Back to login
              </Link>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="alert alert-error mb-6 text-sm bg-red-500/20 text-white border border-red-500/20"
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
                  disabled={loading}
                  className="bg-white/5 border-white/10 focus:border-white/20"
                />

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-purple-400 hover:text-purple-300 hover:underline"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
} 