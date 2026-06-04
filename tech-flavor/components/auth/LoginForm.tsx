// components/auth/LoginForm.tsx
"use client"; // Esta directiva es vital en Next.js para usar hooks de React

import { useState } from "react";
import { signIn } from "../../lib/auth-client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Llamada real a Better Auth
    const { data, error: signInError } = await signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || "Error al iniciar sesión");
      setIsLoading(false);
    } else {
      // Si hay éxito, podríamos redirigir al dashboard del restaurante
      console.log("Login exitoso", data);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">TechFlavor Login</h2>
      
      {error && <div className="p-2 bg-red-100 text-red-600 rounded">{error}</div>}

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="p-2 border rounded"
      />
      
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="p-2 border rounded"
      />

      <button 
        type="submit" 
        disabled={isLoading}
        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? "Cargando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}