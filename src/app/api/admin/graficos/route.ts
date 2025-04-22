import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';

// Tipo para datos agrupados por mes
interface MesData {
  mes: string;
  solicitudes: number;
  ofertas: number;
  aceptadas: number;
  desembolsadas: number;
  comision: number;
}

// Devuelve datos históricos y distribución real para dashboards
export async function GET() {
  try {
    // Histórico mensual de solicitudes, ofertas, aceptadas, desembolsadas, comisión
    const { data: solicitudes, error: errS } = await supabaseAdmin
      .from('solicitudes')
      .select('id, created_at, vehiculo_nuevo, tipo_vehiculo')
    if (errS) throw errS;
    const { data: ofertas, error: errO } = await supabaseAdmin
      .from('ofertas')
      .select('id, created_at, aceptada, desembolsado, fecha_desembolso, monto')
    if (errO) throw errO;

    // Agrupar por mes
    function getMonth(dateStr: string) {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
    }
    const meses: Record<string, MesData> = {};
    solicitudes.forEach(s => {
      const mes = getMonth(s.created_at);
      if (!meses[mes]) meses[mes] = { mes, solicitudes: 0, ofertas: 0, aceptadas: 0, desembolsadas: 0, comision: 0 };
      meses[mes].solicitudes++;
    });
    ofertas.forEach(o => {
      if (!o.created_at) return;
      const mes = getMonth(o.created_at);
      if (!meses[mes]) meses[mes] = { mes, solicitudes: 0, ofertas: 0, aceptadas: 0, desembolsadas: 0, comision: 0 };
      meses[mes].ofertas++;
      if (o.aceptada) meses[mes].aceptadas++;
      if (o.desembolsado && o.fecha_desembolso) {
        const mesDes = getMonth(o.fecha_desembolso);
        if (!meses[mesDes]) meses[mesDes] = { mes: mesDes, solicitudes: 0, ofertas: 0, aceptadas: 0, desembolsadas: 0, comision: 0 };
        meses[mesDes].desembolsadas++;
        meses[mesDes].comision += o.monto ? o.monto * 0.015 : 0;
      }
    });
    const historico = Object.values(meses).sort((a:any,b:any)=>a.mes.localeCompare(b.mes));

    // Distribución por tipo de vehículo
    let nuevo = 0, usado = 0;
    solicitudes.forEach(s => {
      if (s.vehiculo_nuevo) nuevo++;
      else usado++;
    });
    const distribucion = [
      { name: 'Nuevo', value: nuevo },
      { name: 'Usado', value: usado }
    ];

    return NextResponse.json({ historico, distribucion });
  } catch (err:any) {
    console.error('API /admin/graficos error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
