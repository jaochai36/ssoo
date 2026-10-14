"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; redirectTo?: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/control-room");
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email || !password) return { error: "Enter your email and password." };

  const emailMatchesAdmin = Boolean(adminEmail && email.toLowerCase() === adminEmail);
  if (!emailMatchesAdmin) {
    console.warn("[auth] admin email check failed", {
      adminEmailConfigured: Boolean(adminEmail),
      emailMatchesAdmin,
    });
    return { error: "This email is not authorized for admin access." };
  }

  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!hasSupabaseConfig) {
    console.error("[auth] Supabase configuration is missing", {
      supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
    return { error: "Admin authentication is not configured." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.warn("[auth] Supabase sign-in failed", {
      status: error.status,
      code: error.code,
      name: error.name,
    });
    return { error: "The email or password could not be verified." };
  }

  return {
    redirectTo: next.startsWith("/") ? (next as Route) : "/control-room",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
