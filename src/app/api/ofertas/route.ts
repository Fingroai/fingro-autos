import { NextRequest } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const solicitudId = searchParams.get('solicitudId');
    if (!solicitudId) {
      return new Response(JSON.stringify({ error: 'Missing solicitudId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const { data, error } = await supabaseAdmin
      .from('ofertas')
      .select('*, bancos (nombre)')
      .eq('solicitud_id', solicitudId);
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('API /ofertas GET error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { solicitud_id, banco_id, monto, tasa_interes, plazo, comentarios, documentos_requeridos, cuota } = await request.json();
    const { data, error } = await supabaseAdmin
      .from('ofertas')
      .insert({ solicitud_id, banco_id, monto, tasa_interes, plazo, comentarios, documentos_requeridos, cuota })
      .select()
      .single();
    if (error) throw error;
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('API /ofertas POST error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
