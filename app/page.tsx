import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-accent">
        SSOO foundation
      </p>
      <h1 className="max-w-2xl font-display text-5xl leading-tight md:text-7xl">
        A thoughtful starting point for what comes next.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
        The public foundation is ready. Administrators can manage the next phase from the control
        room.
      </p>
      <Link
        href="/control-room"
        className="mt-10 w-fit rounded-full bg-accent px-6 py-3 font-semibold text-paper hover:bg-accent-strong"
      >
        Open control room
      </Link>
    </main>
  );
}
