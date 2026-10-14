import LoginForm from "./form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">SSOO</p>
        <h1 className="mt-5 font-display text-4xl">Welcome back.</h1>
        <p className="mt-3 text-muted">Sign in to access the control room.</p>
        <LoginForm next={params.next} />
      </div>
    </main>
  );
}
