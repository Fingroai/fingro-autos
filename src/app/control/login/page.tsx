"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message || 'Error de autenticación');
      setLoading(false);
      return;
    }
    router.push('/control');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <img src="/logo_transparente.PNG" alt="Fingro logo" className="h-20 w-auto object-contain" style={{maxHeight:80}} />
        </div>
        <h1 className="text-2xl font-bold text-center text-[#0B1F3B] mb-6">Founder Cockpit Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#26B073]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#26B073]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#26B073] text-white py-2 rounded hover:bg-green-600 transition"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
          {error && <p className="mt-2 text-center text-red-600 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
}
