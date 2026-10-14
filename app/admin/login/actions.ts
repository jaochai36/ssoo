"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/control-room");

  if (!email || !password) return { error: "Enter your email and password." };

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (email.toLowerCase() !== adminEmail) return { error: "Those credentials are not authorized." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Those credentials could not be verified." };

  redirect(next.startsWith("/") ? (next as Route) : "/control-room");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
