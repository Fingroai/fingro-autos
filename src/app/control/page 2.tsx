import React from 'react'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function ControlPage() {
  // Métricas del dashboard
  const { count: totalSolicitudes, error: solErr } = await supabaseAdmin
    .from('solicitudes')
    .select('id', { head: true, count: 'exact' })
  if (solErr) throw solErr

  // Ofertas y cálculo de solicitudes con oferta único
  const { data: ofertasAll, error: doErr } = await supabaseAdmin
    .from('ofertas')
    .select('solicitud_id')
  if (doErr) throw doErr
  const solicitudesConOferta = Array.from(new Set(ofertasAll.map(o => o.solicitud_id))).length

  const { count: totalOfertas, error: ofErr } = await supabaseAdmin
    .from('ofertas')
    .select('id', { head: true, count: 'exact' })
  if (ofErr) throw ofErr

  const { count: totalAceptadas, error: acErr } = await supabaseAdmin
    .from('ofertas')
    .select('id', { head: true, count: 'exact' })
    .eq('aceptada', true)
  if (acErr) throw acErr

  const { data: aceptadasData, error: adErr } = await supabaseAdmin
    .from('ofertas')
    .select('created_at, updated_at')
    .eq('aceptada', true)
  if (adErr) throw adErr
  const diffs = aceptadasData.map(({ created_at, updated_at }) =>
    new Date(updated_at).getTime() - new Date(created_at).getTime()
  )
  const avgResponseDays = diffs.length
    ? diffs.reduce((a, b) => a + b, 0) / diffs.length / (1000 * 60 * 60 * 24)
    : null

  const solicitudesConOfertaPercent = totalSolicitudes
    ? Math.round((solicitudesConOferta * 100) / totalSolicitudes)
    : 0
  const ofertasAceptadasPercent = totalOfertas
    ? Math.round((totalAceptadas * 100) / totalOfertas)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-extrabold mb-6 text-[#0B1F3B]">
        Cockpit Founder
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
          <div className="text-4xl font-bold text-[#26B073]">
            {totalSolicitudes}
          </div>
          <div>
            <div className="uppercase text-xs text-gray-500">
              Solicitudes recibidas
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
          <div className="text-4xl font-bold text-[#26B073]">
            {solicitudesConOfertaPercent}%
          </div>
          <div>
            <div className="uppercase text-xs text-gray-500">
              Solicitudes con ofertas
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
          <div className="text-4xl font-bold text-[#26B073]">
            {ofertasAceptadasPercent}%
          </div>
          <div>
            <div className="uppercase text-xs text-gray-500">
              Ofertas aceptadas
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
          <div className="text-4xl font-bold text-[#26B073]">
            {avgResponseDays !== null ? `${avgResponseDays.toFixed(1)}d` : '-'}
          </div>
          <div>
            <div className="uppercase text-xs text-gray-500">
              Tiempo respuesta
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
