// app/auth/callback/page.tsx

import { Suspense } from "react";
import AuthCallback from "./_client/AuthCallback";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <AuthCallback />
    </Suspense>
  );
}
