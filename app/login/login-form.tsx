"use client";

import { useState } from "react";

export default function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/login", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      // Full navigation so the middleware sees the freshly set cookie.
      window.location.href = data.next ?? "/";
      return;
    }

    setError(data.error ?? "Something went wrong. Try again.");
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="next" value={next} />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" autoFocus required />
      <button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Open the log"}
      </button>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
