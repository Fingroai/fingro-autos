'use client'
import React, { useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient'

export default function BancoLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/banco/panel' }
    })
    if (error) setMessage('Error: ' + error.message)
    else setMessage('Revisa tu correo para el enlace mágico.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full flex flex-col items-center">
        <img src="/logo_transparente.PNG" alt="Fingro logo" className="h-20 w-auto object-contain mb-4" style={{maxHeight:80}} />
        <h1 className="text-2xl font-bold mb-4 text-[#0B1F3B]">Login Banco</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Correo institucional"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#26B073]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#26B073] text-white p-2 rounded-md hover:bg-green-600 transition"
          >
            {loading ? 'Enviando...' : 'Enviar enlace mágico'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-600">{message}</p>}
      </div>
    </div>
  )
}
