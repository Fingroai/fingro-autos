import { NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { solicitudId, ofertaId } = await request.json()
    // Marcar oferta como aceptada
    const { error } = await supabaseAdmin
      .from('ofertas')
      .update({ aceptada: true })
      .eq('id', ofertaId)
    if (error) throw error
    // Opcionalmente actualizar estado de solicitud
    await supabaseAdmin
      .from('solicitudes')
      .update({ estado: 'Oferta aceptada', oferta_id_aceptada: ofertaId })
      .eq('id', solicitudId)
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    console.error('API /ofertas/aceptar error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
