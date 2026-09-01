import { Suspense } from "react";
import AdminLoginPage from "./page-content";

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ui text-ui-muted">
      Loading...
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginPage />
    </Suspense>
  );
}
