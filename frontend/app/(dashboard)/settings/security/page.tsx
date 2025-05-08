"use client";

import { Separator } from "@/components/ui/separator";
import { SecurityForm } from "@/components/settings/SecurityForm";

export default function SettingsSecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security settings.
        </p>
      </div>
      <Separator />
      <SecurityForm />
    </div>
  );
}
