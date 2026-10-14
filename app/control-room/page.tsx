import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function ControlRoomPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let counts: { titles: number; people: number; articles: number } | null = null;
  let databaseError = false;

  try {
    const [titles, people, articles] = await Promise.all([
      prisma.title.count(),
      prisma.person.count(),
      prisma.article.count(),
    ]);
    counts = { titles, people, articles };
  } catch (error) {
    databaseError = true;
    console.error("[control-room] database count query failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : "Unknown database error",
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Overview</p>
      <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-5xl">Good to see you.</h1>
          <p className="mt-3 text-muted">{user?.email}</p>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-accent shadow-sm">
          Admin access
        </span>
      </div>
      {databaseError ? (
        <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Database counts are temporarily unavailable. Check the server database connection.
        </p>
      ) : null}
      <section className="mt-12 grid gap-5 md:grid-cols-3">
        {[
          ["Titles", counts?.titles ?? "—", "Published titles in the catalog."],
          ["People", counts?.people ?? "—", "People available in the catalog."],
          ["Articles", counts?.articles ?? "—", "Articles available in the catalog."],
        ].map(([label, value, description]) => (
          <article key={label} className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-4 font-display text-3xl">{value}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
