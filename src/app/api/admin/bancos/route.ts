import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';

// Devuelve KPIs y métricas por banco para el dashboard founder
export async function GET() {
  try {
    // Traer bancos
    const { data: bancos, error: errB } = await supabaseAdmin
      .from('bancos')
      .select('id, nombre, correo_contacto, logo_url')
    if (errB) throw errB;

    // Traer ofertas y solicitudes
    const { data: ofertas, error: errO } = await supabaseAdmin
      .from('ofertas')
      .select('id, banco_id, aceptada, desembolsado, monto, created_at, fecha_desembolso')
    if (errO) throw errO;
    // No es necesario traer solicitudes, no hay banco_id en solicitudes

    // KPIs por banco
    const bancosKPIs = bancos.map(banco => {
      const ofertasBanco = ofertas.filter(o => o.banco_id === banco.id);
      const recibidas = ofertasBanco.length;
      const aceptadas = ofertasBanco.filter(o => o.aceptada).length;
      const desembolsadas = ofertasBanco.filter(o => o.desembolsado).length;
      const gmv = ofertasBanco.filter(o => o.desembolsado).reduce((sum, o) => sum + (o.monto || 0), 0);
      const comision = ofertasBanco.filter(o => o.desembolsado).reduce((sum, o) => sum + ((o.monto || 0) * 0.015), 0);
      return {
        id: banco.id,
        nombre: banco.nombre,
        correo: banco.correo_contacto,
        logo_url: banco.logo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(banco.nombre),
        ofertasEnviadas: recibidas,
        ofertasAceptadas: aceptadas,
        ofertasDesembolsadas: desembolsadas,
        gmv,
        comision: Number(comision.toFixed(2)),
        tasaAceptacion: recibidas ? Math.round((aceptadas * 100) / recibidas) : 0,
        tasaDesembolso: aceptadas ? Math.round((desembolsadas * 100) / aceptadas) : 0,
      };
    });

    return NextResponse.json({ bancos: bancosKPIs });
  } catch (err:any) {
    console.error('API /admin/bancos error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
