"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_HOME_PATHS } from "@/lib/constants/roles";
import { signIn } from "../../lib/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    type SignInData =
      | { user?: { role?: string } }
      | { role?: string }
      | { session?: { user?: { role?: string } } }
      | undefined;

    type SignInResult = { data?: SignInData; error?: { message?: string } };

    const signInResultRaw = await signIn.email({
      email,
      password,
    });

    const signInResult = signInResultRaw as unknown as SignInResult;

    const data = signInResult?.data;
    const signInError = signInResult?.error;

    if (signInError) {
      setError(signInError.message || "Error al iniciar sesión");
    } else {
      let roleRaw: string | undefined = "";

      if (data && "user" in data) {
        roleRaw = data.user?.role;
      } else if (data && "role" in data) {
        roleRaw = data.role;
      } else if (data && "session" in data) {
        roleRaw = data.session?.user?.role;
      }

      const roleFromData = String(roleRaw ?? "");

      const redirectPath =
        ROLE_HOME_PATHS[roleFromData as keyof typeof ROLE_HOME_PATHS] ?? "/";

      console.log("Login exitoso", data, "-> redirigiendo a", redirectPath);
      router.push(redirectPath);
    }

    setIsLoading(false);
  };

  const features = [
    {
      title: "Operaciones sincronizadas",
      description: "Centraliza caja, cocina y atención en una sola vista.",
    },
    {
      title: "Control de órdenes",
      description: "Sigue cada pedido desde que entra hasta que se entrega.",
    },
    {
      title: "Reportes accionables",
      description: "Visualiza ventas, rendimiento y comportamiento diario.",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fff7ed_0%,#fffaf5_36%,#f8fafc_100%)] text-slate-900">
      <div className="absolute inset-0 -z-10 opacity-70 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.15fr_0.85fr]">
        <aside className="relative hidden overflow-hidden px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-6 rounded-4xl bg-linear-to-br from-slate-950 via-slate-900 to-orange-950 shadow-2xl shadow-orange-950/20" />
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between rounded-4xl border border-white/10 px-10 py-12 backdrop-blur-sm">
            <div className="max-w-xl space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-orange-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Plataforma operativa para restaurantes
              </div>

              <div className="space-y-5">
                <h1 className="max-w-lg text-5xl font-semibold tracking-tight text-white xl:text-6xl">
                  TechFlavor organiza el ritmo completo del restaurante.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-slate-300">
                  Un acceso limpio y profesional para administrar pedidos,
                  cocina, ventas y análisis sin saturar la pantalla.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: "24/7", label: "Disponibilidad" },
                  { value: "360°", label: "Control operativo" },
                  { value: "1 vista", label: "Todo centralizado" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="text-2xl font-semibold text-white">
                      {item.value}
                    </div>
                    <div className="mt-1 text-sm text-slate-300">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 grid gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10 backdrop-blur"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-orange-400 to-amber-300 text-slate-950">
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-950/80" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-lg rounded-4xl border border-white/80 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-3 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  Acceso seguro
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 sm:inline-flex">
                  Panel administrativo
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                  Iniciar sesión
                </h2>
                <p className="max-w-md text-sm leading-6 text-slate-500">
                  Ingresa con tu cuenta para acceder al panel de gestión del
                  restaurante.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Correo electrónico
                </label>
                <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
                      <path d="m22 8-10 6L2 8" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="correo@restaurante.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Contraseña
                </label>
                <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                      <rect x="4" y="10" width="16" height="10" rx="2" />
                      <path d="M12 14v2" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-orange-600 via-orange-500 to-amber-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-105 hover:shadow-xl hover:shadow-orange-500/25 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    <span>Entrar al panel</span>
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 sm:grid-cols-2">
              <div>
                <div className="font-medium text-slate-700">Acceso operativo</div>
                <p className="mt-1 leading-6">
                  Diseñado para un ingreso rápido y un flujo de trabajo claro.
                </p>
              </div>
              <div>
                <div className="font-medium text-slate-700">Vista profesional</div>
                <p className="mt-1 leading-6">
                  Interfaz limpia, espaciosa y enfocada en la jerarquía visual.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}