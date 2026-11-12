"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { login } from "./actions";

const input =
  "w-full rounded-2xl border border-sand bg-ivory px-5 py-4 font-semibold outline-none transition focus:border-teal focus:bg-white focus:ring-4 focus:ring-teal/15";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <div className="grid min-h-svh place-items-center bg-deep px-4">
      <form action={action} className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl">
        <img src="/images/brand/logo-full.webp" alt="Aaisaheb Tours and Travels" className="mx-auto h-40 w-auto" />
        <div className="mt-4 text-center font-display text-2xl font-semibold">Admin panel</div>
        <label className="mt-8 block text-sm font-bold">
          ID
          <input name="username" required autoComplete="username" className={`${input} mt-2`} />
        </label>
        <label className="mt-4 block text-sm font-bold">
          Password
          <input name="password" type="password" required autoComplete="current-password" className={`${input} mt-2`} />
        </label>
        {state?.error && <p className="mt-4 font-semibold text-wine">{state.error}</p>}
        <button disabled={pending} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-royal py-4 font-bold text-white disabled:opacity-70">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />} Log in
        </button>
      </form>
    </div>
  );
}
