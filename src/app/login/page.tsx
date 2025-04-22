"use client";
import React, { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/panel" }
    });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Revisa tu correo para el enlace mágico.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-[#0B1F3B]">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#26B073]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#26B073] text-white p-2 rounded-md hover:bg-green-600 transition"
          >
            {loading ? "Enviando..." : "Enviar enlace mágico"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
