import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { AuthForms } from "@/components/auth-forms";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <AuthForms />
        </Card>
      </div>
      <div className="hidden md:block bg-primary relative">
        <div className="absolute inset-0 flex items-center justify-center text-primary-foreground">
          <div className="max-w-md space-y-4 p-8">
            <h1 className="text-4xl font-bold">Digital Wallet</h1>
            <p className="text-lg opacity-90">
              Manage your money securely with our digital wallet solution.
              Track transactions and monitor your balance with ease.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
