"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    setPending(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { error?: string; redirectTo?: string };
      if (!response.ok || !result.redirectTo) {
        setError(result.error ?? "The email or password could not be verified.");
        return;
      }
      router.replace(result.redirectTo as Route);
    } catch {
      setError("Unable to reach the authentication service.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(new FormData(event.currentTarget));
      }}
      className="mt-8 space-y-5"
    >
      <input type="hidden" name="next" value={next ?? "/control-room"} />
      <label className="block text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-accent"
        />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-accent"
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-paper hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
