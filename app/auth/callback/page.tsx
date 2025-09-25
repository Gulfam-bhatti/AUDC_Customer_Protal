// app/auth/callback/page.tsx

import { Suspense } from "react";
import AuthCallback from "./_client/AuthCallback";
import { Loader } from "lucide-react";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="p-6 flex gap-2"><Loader className="animate-spin" /> Loading...</p>}>
      <AuthCallback />
    </Suspense>
  );
}
