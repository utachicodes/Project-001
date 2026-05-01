import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-background">
          <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
