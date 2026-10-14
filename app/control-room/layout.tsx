import { logout } from "@/app/admin/login/actions";

export default function ControlRoomLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-sand/40">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <span className="font-display text-2xl">Control room</span>
          <form action={logout}>
            <button type="submit" className="text-sm font-semibold text-muted hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
