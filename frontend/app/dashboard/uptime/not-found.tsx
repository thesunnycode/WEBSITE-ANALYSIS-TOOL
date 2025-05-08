import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Page Not Found</h2>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
} 