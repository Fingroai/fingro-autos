import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';

// Devuelve solicitudes para el dashboard founder
export async function GET() {
  try {
    // Trae solicitudes y datos clave
    // Trae solicitudes y datos clave
    const { data: solicitudes, error } = await supabaseAdmin
      .from('solicitudes')
      .select('id, created_at, tipo_vehiculo, vehiculo_nuevo, precio, enganche, plazo, nombre, dpi, nit, fecha_nacimiento, telefono, correo, departamento, municipio, direccion, estado_laboral, ocupacion, empresa, ingresos, tiene_deudas, monto_deuda, cuota_deuda, acepta_terminos, documentos, monto_financiar')
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Traer ofertas agrupadas por solicitud
    const { data: ofertas, error: errorOfertas } = await supabaseAdmin
      .from('ofertas')
      .select('id, solicitud_id, aceptada, desembolsado')
    if (errorOfertas) throw errorOfertas;
    // Indexar ofertas por solicitud_id
    const ofertasPorSolicitud: Record<string, any[]> = {};
    ofertas?.forEach((o:any) => {
      if (!ofertasPorSolicitud[o.solicitud_id]) ofertasPorSolicitud[o.solicitud_id] = [];
      ofertasPorSolicitud[o.solicitud_id].push(o);
    });
    // Determinar etapa
    const solicitudesConEtapa = (solicitudes||[]).map((s:any) => {
      const ofertas = ofertasPorSolicitud[s.id] || [];
      let etapa = 'Solicitud enviada';
      if (ofertas.length > 0) etapa = 'Oferta enviada';
      if (ofertas.some((o:any) => o.aceptada)) etapa = 'Oferta aceptada';
      if (ofertas.some((o:any) => o.desembolsado)) etapa = 'Desembolso';
      return { ...s, etapa };
    });
    return NextResponse.json({ solicitudes: solicitudesConEtapa });
  } catch (err:any) {
    console.error('API /admin/solicitudes error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
