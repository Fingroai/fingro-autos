'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient'
import Link from 'next/link'

export default function BancoSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [bancoId, setBancoId] = useState<string | null>(null)
  const [tipoNuevo, setTipoNuevo] = useState(false)
  const [tipoUsado, setTipoUsado] = useState(false)
  const [montoMinimo, setMontoMinimo] = useState('')
  const [montoMaximo, setMontoMaximo] = useState('')
  const [plazoMinimo, setPlazoMinimo] = useState('')
  const [plazoMaximo, setPlazoMaximo] = useState('')
  const [analysts, setAnalysts] = useState<string[]>([])
  const [newAnalyst, setNewAnalyst] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) return window.location.href = '/banco/login'
      setBancoId(user.id)
      const { data: bancoData, error: bErr } = await supabase
        .from('bancos')
        .select('invited_analysts')
        .eq('id', user.id)
        .single()
      if (bErr) { console.error(bErr); return }
      setAnalysts(bancoData?.invited_analysts || [])
      const { data: fData, error: fErr } = await supabase
        .from('filtros_bancarios')
        .select('tipo_carro, monto_minimo, monto_maximo, plazo_minimo, plazo_maximo')
        .eq('banco_id', user.id)
        .single()
      if (fErr) { console.error(fErr); return }
      setTipoNuevo(fData.tipo_carro.includes('nuevo'))
      setTipoUsado(fData.tipo_carro.includes('usado'))
      setMontoMinimo(fData.monto_minimo.toString())
      setMontoMaximo(fData.monto_maximo.toString())
      setPlazoMinimo(fData.plazo_minimo.toString())
      setPlazoMaximo(fData.plazo_maximo.toString())
      setLoading(false)
    }
    loadSettings()
  }, [])

  const handleAddAnalyst = () => {
    if (newAnalyst.trim()) {
      setAnalysts(prev => [...prev, newAnalyst.trim()])
      setNewAnalyst('')
    }
  }

  const handleRemoveAnalyst = (email: string) => {
    setAnalysts(prev => prev.filter(a => a !== email))
  }

  const handleSave = async () => {
    if (!bancoId) return
    setSaving(true)
    // Update analysts
    const { error: bErr } = await supabase
      .from('bancos')
      .update({ invited_analysts: analysts })
      .eq('id', bancoId)
    if (bErr) console.error(bErr)
    // Update filtros
    const filtros = {
      tipo_carro: [tipoNuevo && 'nuevo', tipoUsado && 'usado'].filter(Boolean),
      monto_minimo: parseInt(montoMinimo, 10),
      monto_maximo: parseInt(montoMaximo, 10),
      plazo_minimo: parseInt(plazoMinimo, 10),
      plazo_maximo: parseInt(plazoMaximo, 10),
    }
    const { error: fErr } = await supabase
      .from('filtros_bancarios')
      .update(filtros)
      .eq('banco_id', bancoId)
    if (fErr) console.error(fErr)
    setSaving(false)
    alert('Ajustes guardados correctamente')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Cargando ajustes...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#0B1F3B]">Ajustes de Banco</h1>
          <Link href="/banco/panel" className="text-[#26B073] hover:underline">Volver al panel</Link>
        </header>

        <section className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1F3B]">Configuración de filtros</h2>
          <div>
            <label className="block mb-1">Tipo de vehículo</label>
            <div className="flex space-x-4">
              <button type="button" onClick={() => setTipoNuevo(!tipoNuevo)} className={`px-4 py-2 rounded ${tipoNuevo ? 'bg-[#26B073] text-white' : 'bg-gray-200 text-gray-600'}`}>Nuevo</button>
              <button type="button" onClick={() => setTipoUsado(!tipoUsado)} className={`px-4 py-2 rounded ${tipoUsado ? 'bg-[#26B073] text-white' : 'bg-gray-200 text-gray-600'}`}>Usado</button>
            </div>
          </div>
          <div>
            <label className="block mb-1">Rango de monto (Q)</label>
            <div className="flex items-center space-x-2">
              <input type="number" value={montoMinimo} onChange={e => setMontoMinimo(e.target.value)} placeholder="Mínimo" className="w-full border px-3 py-2 rounded" />
              <span className="text-gray-500">a</span>
              <input type="number" value={montoMaximo} onChange={e => setMontoMaximo(e.target.value)} placeholder="Máximo" className="w-full border px-3 py-2 rounded" />
            </div>
          </div>
          <div>
            <label className="block mb-1">Plazo (meses)</label>
            <div className="flex items-center space-x-2">
              <input type="number" value={plazoMinimo} onChange={e => setPlazoMinimo(e.target.value)} placeholder="Mínimo" className="w-full border px-3 py-2 rounded" />
              <span className="text-gray-500">a</span>
              <input type="number" value={plazoMaximo} onChange={e => setPlazoMaximo(e.target.value)} placeholder="Máximo" className="w-full border px-3 py-2 rounded" />
            </div>
          </div>
        </section>

        <section className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1F3B]">Analistas invitados</h2>
          <div className="flex space-x-2">
            <input type="email" placeholder="Email analista" value={newAnalyst} onChange={e => setNewAnalyst(e.target.value)} className="flex-1 border px-3 py-2 rounded" />
            <button onClick={handleAddAnalyst} className="bg-[#26B073] text-white px-4 py-2 rounded hover:bg-green-600 transition">Añadir</button>
          </div>
          <ul className="list-disc list-inside space-y-2">
            {analysts.map(email => (
              <li key={email} className="flex justify-between items-center">
                <span>{email}</span>
                <button onClick={() => handleRemoveAnalyst(email)} className="text-red-500 hover:text-red-700">×</button>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex justify-end space-x-4">
          <button onClick={() => window.location.href='/banco/panel'} className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-100 transition">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#26B073] text-white rounded hover:bg-green-600 transition disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
        </div>
      </div>
    </div>
  )
}
