import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/dashboard",
          });
        }}
        className="w-full space-y-4"
      >
        <div>
          <h1 className="text-2xl font-semibold">Sign in to Feedlyst</h1>
          <p className="mt-1 text-sm text-gray-600">Use your Feedlyst account credentials.</p>
        </div>
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
        <input name="password" type="password" required placeholder="Password" className="w-full rounded-lg border px-3 py-2" />
        <button type="submit" className="w-full rounded-lg bg-black px-4 py-2 text-white">Sign in</button>
      </form>
    </main>
  );
}
