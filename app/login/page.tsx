import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <main className="gate">
      <div className="gate-card">
        <p className="eyebrow">Independent Study</p>
        <h1>Research Log</h1>
        <p>This log is private. Enter the password you were given to read it.</p>
        <LoginForm next={destination} />
      </div>
    </main>
  );
}
