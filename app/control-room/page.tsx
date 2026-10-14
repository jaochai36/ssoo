import { createClient } from "@/lib/supabase/server";

export default async function ControlRoomPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <section className="mt-12 grid gap-5 md:grid-cols-3">
        {[
          ["Foundation", "Ready", "The application foundation is configured."],
          ["Authentication", "Connected", "Supabase session protection is active."],
          ["Database", "Prisma", "The schema and seed are ready for the next phase."],
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
