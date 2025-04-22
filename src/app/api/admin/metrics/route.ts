import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin'

export async function GET() {
  try {
    // Total solicitudes
    const { count: totalSolicitudes, error: err1 } = await supabaseAdmin
      .from('solicitudes')
      .select('id', { count: 'exact', head: true })
    if (err1) throw err1

    // Total ofertas
    const { count: totalOfertas, error: err2 } = await supabaseAdmin
      .from('ofertas')
      .select('id', { count: 'exact', head: true })
    if (err2) throw err2

    // Solicitudes que reciben al menos 1 oferta
    const { count: solicitudesConOfertaCount, error: err3 } = await supabaseAdmin
      .from('ofertas')
      .select('solicitud_id', { count: 'exact', distinct: true, head: true })
    if (err3) throw err3
    const solicitudesConOfertaPercent = totalSolicitudes
      ? Number(((solicitudesConOfertaCount! / totalSolicitudes!) * 100).toFixed(2))
      : 0

    // Ofertas aceptadas
    const { count: totalAceptadas, error: err4 } = await supabaseAdmin
      .from('ofertas')
      .select('id', { count: 'exact', head: true })
      .eq('aceptada', true)
    if (err4) throw err4
    const offerToAcceptPercent = totalOfertas
      ? Number(((totalAceptadas! / totalOfertas!) * 100).toFixed(2))
      : 0

    // Tiempo promedio a aceptación (días)
    const { data: acceptedOffers, error: err5 } = await supabaseAdmin
      .from('ofertas')
      .select('created_at, updated_at')
      .eq('aceptada', true)
    if (err5) throw err5
    const diffs = acceptedOffers?.map(o => {
      const a = new Date(o.created_at).getTime()
      const b = new Date(o.updated_at).getTime()
      return b - a
    }) || []
    const avgTimeToAccept = diffs.length
      ? Number((diffs.reduce((a, b) => a + b, 0) / diffs.length / (1000 * 60 * 60 * 24)).toFixed(1))
      : null

    // GMV y promedio de ticket
    const { data: offersAccepted, error: err6 } = await supabaseAdmin
      .from('ofertas')
      .select('monto')
      .eq('aceptada', true)
    if (err6) throw err6
    const gmv = offersAccepted?.reduce((sum, o) => sum + (o.monto || 0), 0) || 0
    const avgTicket = totalAceptadas
      ? Number((gmv / totalAceptadas!).toFixed(2))
      : null

    // GMV desembolsado para take rate
    const { data: desembolsos, error: err7 } = await supabaseAdmin
      .from('ofertas')
      .select('monto')
      .eq('desembolsado', true)
    if (err7) throw err7
    const desembolsadoGMV = desembolsos?.reduce((sum, o) => sum + (o.monto || 0), 0) || 0
    const comisionTotal = desembolsos?.reduce((sum, o) => sum + ((o.monto || 0) * 0.015), 0) || 0;
    const takeRatePercent = desembolsadoGMV > 0 ? 1.5 : 0;

    // Bancos activos
    const { count: activeBancos, error: err8 } = await supabaseAdmin
      .from('ofertas')
      .select('banco_id', { count: 'exact', distinct: true, head: true })
    if (err8) throw err8

    return NextResponse.json({
      totalSolicitudes,
      totalOfertas,
      solicitudesConOfertaCount,
      solicitudesConOfertaPercent,
      totalAceptadas,
      offerToAcceptPercent,
      avgTimeToAccept,
      gmv,
      avgTicket,
      activeBancos,
      takeRatePercent,
      comisionTotal: Number(comisionTotal.toFixed(2))
    })
  } catch (err: any) {
    console.error('API /admin/metrics error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
