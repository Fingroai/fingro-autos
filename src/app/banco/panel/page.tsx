'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient'
import Link from 'next/link'

export default function BancoPanelPage() {
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<any>(null)
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerRate, setOfferRate] = useState('')
  const [offerTerm, setOfferTerm] = useState('')
  const [offerComments, setOfferComments] = useState('')
  const [tab, setTab] = useState<'solicitudes'|'enviadas'|'aceptadas'>('solicitudes')
  const [offers, setOffers] = useState<any[]>([])
  // Forzar recarga de datos
  const reloadOffers = async () => {
    const session = await supabase.auth.getSession();
    const user = session.data.session?.user;
    if (user) {
      const { data: oData } = await supabase
        .from('ofertas')
        .select('*, solicitudes (nombre, telefono, correo), desembolsado, fecha_desembolso')
        .eq('banco_id', user.id);
      setOffers(oData || []);
    }
  }
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [offerCuota, setOfferCuota] = useState<number>(0)
  const [offerRCI, setOfferRCI] = useState<number>(0)
  const [offerDTI, setOfferDTI] = useState<number>(0)
  const [offerDocs, setOfferDocs] = useState<FileList | null>(null)
  const [newDocName, setNewDocName] = useState('')
  const [additionalDocs, setAdditionalDocs] = useState<string[]>([])
  const [bankId, setBankId] = useState<string>('')
  const [sendingOffer, setSendingOffer] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showOfferDetailModal, setShowOfferDetailModal] = useState(false);

  // Métricas dinámicas
  const ofertasEnviadasCount = offers.length;
  const distinctSolicitudesConOfertasCount = Array.from(new Set(offers.map(o => o.solicitud_id))).length;
  const acceptedOffersCount = offers.filter(o => o.aceptada).length;
  const percentAccepted = ofertasEnviadasCount ? Math.round(acceptedOffersCount * 100 / ofertasEnviadasCount) : 0;
  const avgResponseTime = (() => {
    const diffs = offers.filter(o => o.aceptada && o.created_at && o.updated_at)
      .map(o => new Date(o.updated_at).getTime() - new Date(o.created_at).getTime());
    if (!diffs.length) return null;
    const avgMs = diffs.reduce((a,b) => a + b, 0) / diffs.length;
    return `${(avgMs / (1000*60*60*24)).toFixed(1)}d`;
  })();

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) return window.location.href = '/banco/login'
      // Cargar filtros
      const { data: fData, error: fErr } = await supabase
        .from('filtros_bancarios')
        .select('*')
        .eq('banco_id', user.id)
        .single()
      if (fErr) return console.error(fErr)
      setFiltro(fData)
      setBankId(user.id)
      // Cargar solicitudes
      const { data: all, error: allErr } = await supabase
        .from('solicitudes')
        .select('*')
      if (allErr) return console.error(allErr)
      // Filtrar localmente con fallback si filtros incompletos
      console.log('Filtros obtenidos:', fData)
      console.log('Solicitudes totales:', all)
      const montoMin = fData.monto_minimo ?? Number.NEGATIVE_INFINITY
      const montoMax = fData.monto_maximo ?? Number.POSITIVE_INFINITY
      const tipos = fData.tipo_carro || []
      const filtered = all.filter(s => {
        const montoOk = s.monto_financiar >= montoMin && s.monto_financiar <= montoMax
        const tipoOk = tipos.length === 0
          || (tipos.includes('nuevo') && s.vehiculo_nuevo)
          || (tipos.includes('usado') && !s.vehiculo_nuevo)
        return montoOk && tipoOk
      })
      console.log('Solicitudes filtradas:', filtered)
      setSolicitudes(filtered)
      // Cargar ofertas enviadas
      const { data: oData, error: oErr } = await supabase
        .from('ofertas')
        .select('*, solicitudes (nombre, telefono, correo)')
        .eq('banco_id', user.id)
      if (oErr) console.error(oErr)
      else setOffers(oData)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (showModal && selectedSolicitud) {
      const amt = parseFloat(offerAmount)
      const rate = parseFloat(offerRate)
      const n = parseInt(offerTerm, 10)
      if (!isNaN(amt) && !isNaN(rate) && !isNaN(n) && selectedSolicitud.ingresos) {
        const r = rate / 100 / 12
        const cuotaVal = (amt * r) / (1 - Math.pow(1 + r, -n))
        const ingresos = selectedSolicitud.ingresos
        const deudaCuota = selectedSolicitud.cuota_deuda ?? 0
        setOfferCuota(cuotaVal)
        setOfferRCI(cuotaVal / ingresos)
        setOfferDTI((cuotaVal + deudaCuota) / ingresos)
      }
    }
  }, [offerAmount, offerRate, offerTerm, selectedSolicitud, showModal])

  const Spinner = () => (
    <span className="animate-spin inline-block h-6 w-6 border-4 border-[#26B073] border-t-transparent rounded-full"></span>
  )

  const filteredSolicitudes = solicitudes.filter(s => s.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSendOffer = async () => {
    if (!selectedSolicitud) return
    setSendingOffer(true)
    try {
      const payload = {
        solicitud_id: selectedSolicitud.id,
        banco_id: bankId,
        monto: parseFloat(offerAmount),
        tasa_interes: parseFloat(offerRate),
        plazo: parseInt(offerTerm, 10),
        comentarios: offerComments,
        documentos_requeridos: additionalDocs,
        cuota: offerCuota
      }
      const res = await fetch('/api/ofertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Error al enviar oferta')
      const newOffer = await res.json()
      setOffers(prev => [...prev, newOffer])
      setShowModal(false)
    } catch (error) {
      console.error(error)
      alert('Error al enviar oferta')
    } finally {
      setSendingOffer(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <section className="bg-gradient-to-r from-[#26B073] to-[#0B1F3B] text-white rounded-lg p-6 mb-6 shadow-lg">
          <h1 className="text-4xl font-extrabold mb-2">Panel de Solicitudes</h1>
          <p className="text-lg opacity-80">Gestiona y responde rápidamente a tus solicitudes</p>
          <div className="flex justify-end mb-4">
            <Link href="/banco/settings" className="bg-white text-[#26B073] px-4 py-2 rounded shadow hover:bg-gray-100 transition">
              Ajustes de filtros & analistas
            </Link>
          </div>
        </section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
            <div className="text-4xl font-bold text-[#26B073]">{solicitudes.length}</div>
            <div><div className="uppercase text-xs text-gray-500">Solicitudes recibidas</div></div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
            <div className="text-4xl font-bold text-[#26B073]">{distinctSolicitudesConOfertasCount}</div>
            <div><div className="uppercase text-xs text-gray-500">Solicitudes con ofertas</div></div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
            <div className="text-4xl font-bold text-[#26B073]">{percentAccepted}%</div>
            <div><div className="uppercase text-xs text-gray-500">Ofertas aceptadas</div></div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
            <div className="text-4xl font-bold text-[#26B073]">{avgResponseTime || '—'}</div>
            <div><div className="uppercase text-xs text-gray-500">Tiempo respuesta</div></div>
          </div>
        </div>
        {/* Navegación de secciones */}
        <div className="mb-4">
          <nav className="flex border-b border-gray-200 space-x-6">
            <button onClick={() => setTab('solicitudes')} className={`pb-3 ${tab==='solicitudes'?'border-b-2 border-[#26B073] text-[#26B073]':'text-gray-600'}`}>Solicitudes</button>
            <button onClick={() => setTab('enviadas')} className={`pb-3 ${tab==='enviadas'?'border-b-2 border-[#26B073] text-[#26B073]':'text-gray-600'}`}>Ofertas enviadas</button>
            <button onClick={() => setTab('aceptadas')} className={`pb-3 ${tab==='aceptadas'?'border-b-2 border-[#26B073] text-[#26B073]':'text-gray-600'}`}>Ofertas aceptadas</button>
          </nav>
        </div>
        {tab==='solicitudes' && (
        <div className="mb-4 flex justify-end">
          <input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border rounded px-3 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-[#26B073]" />
        </div>
        )}
        {tab==='solicitudes' && (
          loading ? (
            <p><Spinner /> Cargando solicitudes...</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow rounded p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#0B1F3B]">Solicitudes Disponibles</h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0B1F3B]">
                  <tr>
                    <th className="px-4 py-2 text-left text-white">Solicitante</th>
                    <th className="px-4 py-2 text-left text-white">Monto</th>
                    <th className="px-4 py-2 text-left text-white">Plazo (meses)</th>
                    <th className="px-4 py-2 text-left text-white">Fecha</th>
                    <th className="px-4 py-2 text-left text-white">Tipo de vehículo</th>
                    <th className="px-4 py-2 text-left text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSolicitudes.length > 0 ? filteredSolicitudes.map(s => {
                    return (
                      <tr key={s.id} className="hover:bg-gray-100 even:bg-gray-50">
                        <td className="px-4 py-2">{s.nombre}</td>
                        <td className="px-4 py-2">Q{s.monto_financiar.toLocaleString()}</td>
                        <td className="px-4 py-2">{s.plazo}</td>
                        <td className="px-4 py-2">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{s.vehiculo_nuevo ? 'Nuevo' : 'Usado'}</td>
                        <td className="px-4 py-2 space-x-2">
                          <button onClick={() => { setSelectedSolicitud(s); setShowDetailModal(true)}} className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">Detalles</button>
                          <button onClick={() => { setSelectedSolicitud(s); setOfferAmount(s.monto_financiar.toString()); setOfferTerm(s.plazo.toString()); setShowModal(true)}} className="px-3 py-1 bg-[#26B073] text-white rounded hover:bg-green-600 transition">Enviar oferta</button>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-gray-600">
                        No hay solicitudes disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        )}
        {tab==='enviadas' && (
          <div className="bg-white shadow rounded p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#0B1F3B]">Ofertas Enviadas</h2>
            {offers.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0B1F3B]">
                  <tr>
                    <th className="px-4 py-2 text-left text-white">Nombre</th>
                    <th className="px-4 py-2 text-left text-white">Monto</th>
                    <th className="px-4 py-2 text-left text-white">Plazo</th>
                    <th className="px-4 py-2 text-left text-white">Fecha</th>
                    <th className="px-4 py-2 text-left text-white">Documentos Adicionales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {offers.map(o => {
                    const contact = Array.isArray(o.solicitudes) ? o.solicitudes[0] : o.solicitudes;
                    return (
                      <tr key={o.id} className="hover:bg-gray-100 even:bg-gray-50 cursor-pointer" onClick={() => { setSelectedOffer({ ...o, solicitudData: solicitudes.find(s => s.id === o.solicitud_id) }); setShowOfferDetailModal(true); setShowDetailModal(false); }}>
                        <td className="px-4 py-2">{contact?.nombre}</td>
                        <td className="px-4 py-2">Q{o.monto?.toLocaleString()}</td>
                        <td className="px-4 py-2">{o.plazo}</td>
                        <td className="px-4 py-2">{o.updated_at ? new Date(o.updated_at).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-2">
                          <ul className="list-disc pl-5 space-y-1">
                            {o.documentos_requeridos?.map((doc: string) => (
                              <li key={doc} className="font-medium">{doc}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : <p className="text-gray-500">Aún no has enviado ofertas.</p>}
          </div>
        )}
        {tab==='aceptadas' && (
          <div className="bg-white shadow rounded p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4 text-[#0B1F3B]">Ofertas Aceptadas</h2>
            {offers.filter(o => o.aceptada).length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0B1F3B]">
                  <tr>
                    <th className="px-4 py-2 text-left text-white">Nombre</th>
                    <th className="px-4 py-2 text-left text-white">Contacto</th>
                    <th className="px-4 py-2 text-left text-white">Precio</th>
                    <th className="px-4 py-2 text-left text-white">Enganche</th>
                    <th className="px-4 py-2 text-left text-white">Monto</th>
                    <th className="px-4 py-2 text-left text-white">Cuota</th>
                    <th className="px-4 py-2 text-left text-white">RCI</th>
                    <th className="px-4 py-2 text-left text-white">DTI</th>
                    <th className="px-4 py-2 text-left text-white">Estado Docs</th>
                    <th className="px-4 py-2 text-left text-white">Fecha Acept.</th>
                    <th className="px-4 py-2 text-left text-white">Desembolsado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {offers.filter(o => o.aceptada).map(o => {
                    const sol = solicitudes.find(s => s.id === o.solicitud_id);
                    const ingresos = sol?.ingresos || 0;
                    const deudaCuota = sol?.cuota_deuda || 0;
                    const rci = ingresos ? (o.cuota / ingresos).toFixed(2) : '-';
                    const dti = ingresos ? ((o.cuota + deudaCuota) / ingresos).toFixed(2) : '-';
                    const docsState = sol && Object.values(sol.documentos || {}).filter(Boolean).length === 3 ? 'Completo' : 'Incompleto';
                    const contact = Array.isArray(o.solicitudes) ? o.solicitudes[0] : o.solicitudes;
                    return (
                      <tr key={o.id} className="hover:bg-gray-100 even:bg-gray-50 cursor-pointer" onClick={() => { setSelectedOffer({ ...o, solicitudData: sol }); setShowOfferDetailModal(true); setShowDetailModal(false); }}>
                        <td className="px-4 py-2">{contact?.nombre}</td>
                        <td className="px-4 py-2">
                          <div>{contact?.correo}</div>
                          <div>{contact?.telefono}</div>
                        </td>
                        <td className="px-4 py-2">Q{sol?.precio?.toLocaleString() || '-'}</td>
                        <td className="px-4 py-2">Q{sol?.enganche?.toLocaleString() || '-'}</td>
                        <td className="px-4 py-2">Q{o.monto?.toLocaleString()}</td>
                        <td className="px-4 py-2">Q{o.cuota?.toLocaleString()}</td>
                        <td className="px-4 py-2">{rci}</td>
                        <td className="px-4 py-2">{dti}</td>
                        <td className="px-4 py-2">{docsState}</td>
                        <td className="px-4 py-2">{o.updated_at ? new Date(o.updated_at).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-2">
                          {o.desembolsado ? (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Sí</span>
                          ) : (
                            <button
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition disabled:opacity-60"
                              disabled={!!o._desembolsando}
                              onClick={async (e) => {
                                e.stopPropagation();
                                setOffers(prev => prev.map(of => of.id === o.id ? { ...of, _desembolsando: true } : of));
                                const { error } = await supabase
                                  .from('ofertas')
                                  .update({ desembolsado: true, fecha_desembolso: new Date().toISOString() })
                                  .eq('id', o.id);
                                if (error) {
                                  alert('Error al marcar como desembolsado');
                                  setOffers(prev => prev.map(of => of.id === o.id ? { ...of, _desembolsando: false } : of));
                                } else {
                                  await reloadOffers();
                                }
                              }}
                            >
                              {o._desembolsando ? 'Guardando...' : 'Marcar como desembolsado'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No tienes ofertas aceptadas.</p>
            )}
          </div>
        )}
      </div>
      {/* Modal de Envío de Oferta */}
      {showModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-2 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">×</button>
            <h3 className="text-xl font-semibold mb-4">Enviar oferta a {selectedSolicitud.nombre}</h3>
            <div className="space-y-3">
              <div><label className="block text-sm mb-1">Monto a financiar</label><input type="number" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} className="w-full border rounded px-3 py-2" /></div>
              <div><label className="block text-sm mb-1">Tasa de interés (%)</label><input type="number" value={offerRate} onChange={e => setOfferRate(e.target.value)} className="w-full border rounded px-3 py-2" /></div>
              <div><label className="block text-sm mb-1">Plazo (meses)</label><input type="number" value={offerTerm} onChange={e => setOfferTerm(e.target.value)} className="w-full border rounded px-3 py-2" /></div>
              <div><label className="block text-sm mb-1">Comentarios</label><textarea value={offerComments} onChange={e => setOfferComments(e.target.value)} className="w-full border rounded px-3 py-2" rows={3}></textarea></div>
              <div>
                <label className="block text-sm mb-1">Nombre documento adicional</label>
                <div className="flex space-x-2">
                  <input type="text" value={newDocName} onChange={e => setNewDocName(e.target.value)} className="w-full border rounded px-3 py-2" />
                  <button onClick={() => {
                    const name = newDocName.trim()
                    if (name) { setAdditionalDocs([...additionalDocs, name]); setNewDocName('') }
                  }} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Agregar</button>
                </div>
                {additionalDocs.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <h4 className="font-medium">Documentos requeridos:</h4>
                    {additionalDocs.map((doc, i) => (
                      <div key={i} className="flex justify-between items-center bg-gray-100 px-3 py-1 rounded">
                        <span>{doc}</span>
                        <button onClick={() => setAdditionalDocs(additionalDocs.filter((_, j) => j !== i))} className="text-red-500">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-2 text-gray-700">
              <div><span className="font-medium">Cuota mensual estimada:</span> Q{offerCuota.toFixed(2)}</div>
              <div><span className="font-medium">RCI:</span> {(offerRCI*100).toFixed(2)}%</div>
              <div><span className="font-medium">DTI:</span> {(offerDTI*100).toFixed(2)}%</div>
            </div>
            <button onClick={handleSendOffer} disabled={sendingOffer} className="mt-4 bg-[#26B073] text-white px-4 py-2 rounded hover:bg-green-600 transition">{sendingOffer ? 'Enviando...' : 'Confirmar oferta'}</button>
          </div>
        </div>
      )}
      {showDetailModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-2 relative">
            <button onClick={() => setShowDetailModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">×</button>
            <h3 className="text-xl font-semibold mb-4">Detalles de Solicitud</h3>
            <div className="space-y-2 text-gray-800">
              <div><span className="font-medium">Vehículo:</span> {selectedSolicitud.tipo_vehiculo} ({selectedSolicitud.vehiculo_nuevo ? 'Nuevo' : 'Usado'})</div>
              <div><span className="font-medium">Marca/Modelo/Año:</span> {selectedSolicitud.marca_modelo_anio}</div>
              <div><span className="font-medium">Precio:</span> Q{selectedSolicitud.precio.toLocaleString()}</div>
              <div><span className="font-medium">Enganche:</span> Q{selectedSolicitud.enganche.toLocaleString()}</div>
              <div><span className="font-medium">Monto a financiar:</span> Q{selectedSolicitud.monto_financiar.toLocaleString()}</div>
              <div><span className="font-medium">Plazo:</span> {selectedSolicitud.plazo} meses</div>
              <div><span className="font-medium">Fecha solicitud:</span> {new Date(selectedSolicitud.created_at).toLocaleDateString()}</div>
              <hr/>
              <div><span className="font-medium">Nombre:</span> {selectedSolicitud.nombre}</div>
              <div><span className="font-medium">DPI:</span> {selectedSolicitud.dpi}</div>
              <div><span className="font-medium">NIT:</span> {selectedSolicitud.nit}</div>
              <div><span className="font-medium">Fecha Nacimiento:</span> {new Date(selectedSolicitud.fecha_nacimiento).toLocaleDateString()}</div>
              <div><span className="font-medium">Departamento:</span> {selectedSolicitud.departamento}</div>
              <div><span className="font-medium">Municipio:</span> {selectedSolicitud.municipio}</div>
              <div><span className="font-medium">Dirección:</span> {selectedSolicitud.direccion}</div>
              <hr/>
              <div><span className="font-medium">Estado Laboral:</span> {selectedSolicitud.estado_laboral}</div>
              <div><span className="font-medium">Ocupación:</span> {selectedSolicitud.ocupacion}</div>
              <div><span className="font-medium">Empresa:</span> {selectedSolicitud.empresa}</div>
              <div><span className="font-medium">Ingresos:</span> Q{selectedSolicitud.ingresos.toLocaleString()}</div>
              <div><span className="font-medium">Tiene Deudas:</span> {selectedSolicitud.tiene_deudas ? 'Sí' : 'No'}</div>
              {selectedSolicitud.tiene_deudas && (
                <> 
                  <div><span className="font-medium">Monto Deuda:</span> Q{selectedSolicitud.monto_deuda?.toLocaleString()}</div>
                  <div><span className="font-medium">Cuota Deuda:</span> Q{selectedSolicitud.cuota_deuda?.toLocaleString()}</div>
                </>
              )}
              <hr/>
              <div><span className="font-medium">Acepta Términos:</span> {selectedSolicitud.acepta_terminos ? 'Sí' : 'No'}</div>
              {Object.entries(((selectedSolicitud.documentos ?? {}) as Record<string,string>)).map(([key, url]) => (
                <div key={key}><span className="font-medium">{key}:</span> <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver documento</a></div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => { setShowDetailModal(false); setShowModal(true); setOfferAmount(selectedSolicitud.monto_financiar.toString()); setOfferTerm(selectedSolicitud.plazo.toString()); }} className="px-4 py-2 bg-[#26B073] text-white rounded hover:bg-green-600 transition">Enviar oferta</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Detalle de Oferta Aceptada */}
      {showOfferDetailModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-2 relative overflow-auto">
            <button onClick={() => setShowOfferDetailModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">×</button>
            <h3 className="text-xl font-semibold mb-4">{selectedOffer.aceptada ? 'Detalle de Oferta Aceptada' : 'Detalle de Oferta Enviada'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-[#0B1F3B]">{selectedOffer.aceptada ? 'Oferta Aceptada' : 'Oferta Enviada'}</h4>
                <dl className="space-y-2">
                  {selectedOffer.aceptada ? (
                    <>
                      <div className="flex justify-between"><dt className="text-gray-600">Monto a financiar:</dt><dd className="font-medium">Q{selectedOffer.monto?.toLocaleString()}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-600">Tasa (%):</dt><dd className="font-medium">{selectedOffer.tasa_interes || selectedOffer.tasa}%</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-600">Plazo:</dt><dd className="font-medium">{selectedOffer.plazo} meses</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-600">Cuota mensual:</dt><dd className="font-medium">Q{selectedOffer.cuota?.toLocaleString()}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-600">Comentarios:</dt><dd className="font-medium">{selectedOffer.comentarios || selectedOffer.comments}</dd></div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between"><dt className="text-gray-600">Nombre:</dt><dd className="font-medium">{selectedOffer.solicitudData.nombre}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-600">Monto:</dt><dd className="font-medium">Q{selectedOffer.monto?.toLocaleString()}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-600">Plazo:</dt><dd className="font-medium">{selectedOffer.plazo} meses</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-600">Fecha oferta:</dt><dd className="font-medium">{new Date(selectedOffer.created_at).toLocaleDateString()}</dd></div>
                      <dt className="text-gray-600">Documentos Adicionales:</dt>
                      <dd>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedOffer.documentos_requeridos?.map((doc: string) => (
                            <li key={doc} className="font-medium">{doc}</li>
                          ))}
                        </ul>
                      </dd>
                    </>
                  )}
                </dl>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-[#0B1F3B]">Solicitud</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between"><dt className="text-gray-600">Vehículo:</dt><dd className="font-medium">{selectedOffer.solicitudData.tipo_vehiculo} ({selectedOffer.solicitudData.vehiculo_nuevo ? 'Nuevo' : 'Usado'})</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Marca/Modelo/Año:</dt><dd className="font-medium">{selectedOffer.solicitudData.marca_modelo_anio}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Precio:</dt><dd className="font-medium">Q{selectedOffer.solicitudData.precio?.toLocaleString()}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Enganche:</dt><dd className="font-medium">Q{selectedOffer.solicitudData.enganche?.toLocaleString()}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Monto a financiar:</dt><dd className="font-medium">Q{selectedOffer.solicitudData.monto_financiar?.toLocaleString()}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Plazo:</dt><dd className="font-medium">{selectedOffer.solicitudData.plazo} meses</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Fecha solicitud:</dt><dd className="font-medium">{new Date(selectedOffer.solicitudData.created_at).toLocaleDateString()}</dd></div>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2 text-[#0B1F3B]">Documentos de Solicitud</h4>
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries((selectedOffer.solicitudData.documentos as Record<string,string>)).map(([key, url]) => (
                  <li key={key}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{key}</a></li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              {!selectedOffer.desembolsado && selectedOffer.aceptada && (
                <button
                  onClick={async () => {
                    await supabase
                      .from('ofertas')
                      .update({ desembolsado: true, fecha_desembolso: new Date().toISOString() })
                      .eq('id', selectedOffer.id);
                    setShowOfferDetailModal(false);
                    // Refrescar ofertas
                    const user = (await supabase.auth.getSession()).data.session?.user;
                    if (user) {
                      const { data: oData } = await supabase
                        .from('ofertas')
                        .select('*, solicitudes (nombre, telefono, correo)')
                        .eq('banco_id', user.id);
                      setOffers(oData || []);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Marcar como desembolsado
                </button>
              )}
              <button onClick={() => setShowOfferDetailModal(false)} className="px-4 py-2 bg-[#26B073] text-white rounded hover:bg-green-600 transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
