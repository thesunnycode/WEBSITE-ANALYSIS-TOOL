"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrengthIndicator } from "@/components/ui/PasswordStrengthIndicator";

const securityFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SecurityFormValues = z.infer<typeof securityFormSchema>;

export function SecurityForm() {
  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: SecurityFormValues) {
    // TODO: Implement password change
    console.log(data);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Current Password
          </label>
          <Input
            id="currentPassword"
            type="password"
            {...form.register("currentPassword")}
            className="mt-1"
          />
          {form.formState.errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.currentPassword.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            {...form.register("newPassword")}
            className="mt-1"
          />
          <PasswordStrengthIndicator
            password={form.watch("newPassword")}
            className="mt-2"
          />
          {form.formState.errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.newPassword.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            {...form.register("confirmPassword")}
            className="mt-1"
          />
          {form.formState.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>
      <Button type="submit">Update password</Button>
    </form>
  );
}
