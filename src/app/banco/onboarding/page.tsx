'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function OnboardingBancoPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [idFiscal, setIdFiscal] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [clientAccount, setClientAccount] = useState('')
  const [invitedAnalysts, setInvitedAnalysts] = useState('')
  const [tipoNuevo, setTipoNuevo] = useState(false)
  const [tipoUsado, setTipoUsado] = useState(false)
  const [montoMinimo, setMontoMinimo] = useState('')
  const [montoMaximo, setMontoMaximo] = useState('')
  const [plazoMinimo, setPlazoMinimo] = useState('')
  const [plazoMaximo, setPlazoMaximo] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault()
    // Si no es el último paso, avanzar wizard en lugar de enviar
    if (step < 2) {
      setStep(step + 1)
      return
    }
    setLoading(true)
    try {
      let logo_url = ''
      if (logoFile) {
        const path = `logos/${uuidv4()}_${logoFile.name}`
        const { data, error: uploadError } = await supabase.storage.from('logos').upload(path, logoFile)
        if (uploadError) throw uploadError
        logo_url = supabase.storage.from('logos').getPublicUrl(data.path).data.publicUrl
      }
      const analysts = invitedAnalysts.split(',').map(s => s.trim()).filter(Boolean)
      const filtros = {
        tipo_carro: [tipoNuevo && 'nuevo', tipoUsado && 'usado'].filter(Boolean),
        monto_minimo: montoMinimo,
        monto_maximo: montoMaximo,
        plazo_minimo: parseInt(plazoMinimo),
        plazo_maximo: parseInt(plazoMaximo),
      }
      const body = { nombre, id_fiscal: idFiscal, correo, password, logo_url, client_account: clientAccount, invited_analysts: analysts, filtros }
      const res = await fetch('/api/banco/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        router.push('/banco/login')
      } else {
        const data = await res.json()
        alert('Error: ' + data.error)
      }
    } catch (err) {
      console.error(err)
      alert('Error en registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-lg p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-2 text-[#0B1F3B] text-center">Regístrate como Banco</h1>
        <p className="mb-6 text-gray-600 text-center">Recibe solicitudes de crédito según tus filtros y colabora con analistas.</p>
        <form onSubmit={e => e.preventDefault()} className="space-y-8">
          {/* Stepper */}
          <div className="flex items-center mb-6">
            {['Entidad','Acceso','Filtros'].map((lbl,idx)=>(
              <div key={idx} className="flex-1 flex items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step===idx?'bg-[#26B073] text-white':'bg-gray-200 text-gray-500'}`}>{idx+1}</div>
                <span className={`ml-2 ${step===idx?'text-[#26B073] font-semibold':'text-gray-500'}`}>{lbl}</span>
                {idx<2 && <div className="flex-1 h-px bg-gray-200 mx-2"></div>}
              </div>))}
          </div>
          {step === 0 && (
            <div>
              {/* Información de la entidad */}
              <h2 className="text-xl font-semibold mb-2 text-[#0B1F3B]">Información de la entidad</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Nombre de la entidad</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1">NIT</label>
                  <input type="text" value={idFiscal} onChange={e => setIdFiscal(e.target.value)} required className="w-full border px-3 py-2 rounded" placeholder="123456-7" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block mb-1">Logo de la entidad</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center relative hover:border-[#26B073] transition">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      <p className="text-sm">Arrastra o haz click para subir</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] ?? null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              {/* Acceso y analistas */}
              <h2 className="text-xl font-semibold mb-2 text-[#0B1F3B]">Acceso y analistas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Correo institucional</label>
                  <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required className="w-full border px-3 py-2 rounded" placeholder="tu@banco.com" />
                </div>
                <div>
                  <label className="block mb-1">Contraseña <span className="text-sm text-gray-500">(mín 8 caracteres)</span></label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1">Correos de analistas</label>
                  <textarea value={invitedAnalysts} onChange={e => setInvitedAnalysts(e.target.value)} placeholder="analista1@banco.com, analista2@banco.com" className="w-full border px-3 py-2 rounded h-24" />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1">ID interno <span className="text-sm text-gray-500">(opcional)</span></label>
                  <input type="text" value={clientAccount} onChange={e => setClientAccount(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Ej. ACME123" />
                  <p className="text-sm text-gray-500">Identificador para tu sistema interno.</p>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#0B1F3B]">Filtros de financiamiento</h2>
              <div className="mb-4">
                <label className="block mb-1">Tipo de vehículo</label>
                <div className="flex space-x-4">
                  <button type="button" onClick={() => setTipoNuevo(!tipoNuevo)} className={`px-4 py-2 rounded ${tipoNuevo ? 'bg-[#26B073] text-white' : 'bg-gray-200 text-gray-600'}`}>Nuevo</button>
                  <button type="button" onClick={() => setTipoUsado(!tipoUsado)} className={`px-4 py-2 rounded ${tipoUsado ? 'bg-[#26B073] text-white' : 'bg-gray-200 text-gray-600'}`}>Usado</button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Rango de monto (Q)</label>
                <div className="flex items-center space-x-2">
                  <input type="number" value={montoMinimo} onChange={e => setMontoMinimo(e.target.value)} placeholder="Mínimo" className="w-full border px-3 py-2 rounded" />
                  <span className="text-gray-500">a</span>
                  <input type="number" value={montoMaximo} onChange={e => setMontoMaximo(e.target.value)} placeholder="Máximo" className="w-full border px-3 py-2 rounded" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Plazo (meses)</label>
                <div className="flex items-center space-x-2">
                  <input type="number" value={plazoMinimo} onChange={e => setPlazoMinimo(e.target.value)} placeholder="Mínimo" className="w-full border px-3 py-2 rounded" />
                  <span className="text-gray-500">a</span>
                  <input type="number" value={plazoMaximo} onChange={e => setPlazoMaximo(e.target.value)} placeholder="Máximo" className="w-full border px-3 py-2 rounded" />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between mt-6">
            {step > 0 && <button type="button" onClick={() => setStep(step-1)} className="px-4 py-2 bg-gray-200 rounded">Anterior</button>}
            {step < 2 ? <button type="button" onClick={() => setStep(step+1)} className="px-4 py-2 bg-[#26B073] text-white rounded">Siguiente</button> : <button type="button" onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-[#26B073] text-white rounded">{loading ? 'Registrando...' : 'Registrarse'}</button>}
          </div>
        </form>
      </div>
    </div>
  )
}
