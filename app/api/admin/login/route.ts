import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/control-room");
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const emailMatchesAdmin = Boolean(adminEmail && email.toLowerCase() === adminEmail);
  if (!emailMatchesAdmin) {
    console.warn("[auth] admin email check failed", {
      adminEmailConfigured: Boolean(adminEmail),
      emailMatchesAdmin,
    });
    return NextResponse.json(
      { error: "This email is not authorized for admin access." },
      { status: 403 },
    );
  }

  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!hasSupabaseConfig) {
    console.error("[auth] Supabase configuration is missing", {
      supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
    return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.warn("[auth] Supabase sign-in failed", {
      status: error.status,
      code: error.code,
      name: error.name,
    });
    return NextResponse.json(
      { error: "The email or password could not be verified." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    redirectTo: next.startsWith("/") ? next : "/control-room",
  });
}
