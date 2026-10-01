"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        name: form.get("name"),
        accountName: form.get("accountName"),
      }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Registration failed");
      return;
    }
    router.push("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form onSubmit={submit} className="w-full space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Create your Feedlyst account</h1>
          <p className="mt-1 text-sm text-gray-600">Your first workspace and project are created automatically.</p>
        </div>
        <input name="name" placeholder="Your name" className="w-full rounded-lg border px-3 py-2" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
        <input name="password" type="password" minLength={8} required placeholder="Password" className="w-full rounded-lg border px-3 py-2" />
        <input name="accountName" required placeholder="Workspace name" className="w-full rounded-lg border px-3 py-2" />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" className="w-full rounded-lg bg-black px-4 py-2 text-white">Create account</button>
      </form>
    </main>
  );
}
