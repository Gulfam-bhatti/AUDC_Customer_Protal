"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const searchParams = useSearchParams();
  
  const access_token = searchParams.get("access_token");
  const refresh_token = searchParams.get("refresh_token");

  useEffect(() => {
    const setSession = async () => {
      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error("Session error:", error.message);
        } else {
          console.log("Session set successfully:", data);
          window.location.href = "/dashboard/tenants";
        }
      }
    };

    setSession();
  }, [access_token, refresh_token]);

  return <p className="p-6">Logging you in, please wait...</p>;
}
