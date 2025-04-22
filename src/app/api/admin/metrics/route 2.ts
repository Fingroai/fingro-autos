import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    // Total de solicitudes
    const { count: totalSolicitudes, error: err1 } = await supabaseAdmin
      .from('solicitudes')
      .select('id', { head: true, count: 'exact' })
    if (err1) throw err1
    const totalSolicitudesCount = totalSolicitudes ?? 0

    // Total de ofertas
    const { count: totalOfertas, error: err2 } = await supabaseAdmin
      .from('ofertas')
      .select('id', { head: true, count: 'exact' })
    if (err2) throw err2
    const totalOfertasCount = totalOfertas ?? 0

    // Ofertas y número de solicitudes con al menos 1 oferta
    const { data: ofertasAll, error: err3 } = await supabaseAdmin
      .from('ofertas')
      .select('solicitud_id')
    if (err3) throw err3
    const solicitudesConOferta = Array.from(new Set(ofertasAll.map(o => o.solicitud_id))).length

    // Ofertas aceptadas
    const { count: totalAceptadas, error: err4 } = await supabaseAdmin
      .from('ofertas')
      .select('id', { head: true, count: 'exact' })
      .eq('aceptada', true)
    if (err4) throw err4
    const totalAceptadasCount = totalAceptadas ?? 0

    // Tiempo promedio de respuesta (días): no disponible (sin updated_at)
    const avgResponseDays = null

    return NextResponse.json({
      totalSolicitudes: totalSolicitudesCount,
      totalOfertas: totalOfertasCount,
      solicitudesConOfertaPercent: totalSolicitudesCount ? Math.round((solicitudesConOferta * 100) / totalSolicitudesCount) : 0,
      ofertasAceptadasPercent: totalOfertasCount ? Math.round((totalAceptadasCount * 100) / totalOfertasCount) : 0,
      avgResponseDays,
    })
  } catch (err: any) {
    console.error('API /admin/metrics error:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
