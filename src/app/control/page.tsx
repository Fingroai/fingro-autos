"use client";

import React, { useEffect, useState } from 'react';
import GraficosDashboard from './GraficosDashboard';
import BancosTable from './BancosTable';
import SolicitudesTable from './SolicitudesTable';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ControlDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [graficos, setGraficos] = useState<any>(null);
  const [loadingGraficos, setLoadingGraficos] = useState(true);
  const [bancos, setBancos] = useState<any[]>([]);
  const [loadingBancos, setLoadingBancos] = useState(true);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/control/login');
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error)
      .finally(() => setLoadingMetrics(false));
    fetch('/api/admin/graficos')
      .then(res => res.json())
      .then(data => setGraficos(data))
      .catch(console.error)
      .finally(() => setLoadingGraficos(false));
    fetch('/api/admin/bancos')
      .then(res => res.json())
      .then(data => setBancos(data.bancos || []))
      .catch(console.error)
      .finally(() => setLoadingBancos(false));
    fetch('/api/admin/solicitudes')
      .then(res => res.json())
      .then(data => setSolicitudes(data.solicitudes || []))
      .catch(console.error)
      .finally(() => setLoadingSolicitudes(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-[#26B073] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold text-[#0B1F3B] mb-6">Founder Cockpit Dashboard</h2>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Solicitudes', value: loadingMetrics ? '...' : metrics?.totalSolicitudes },
          { label: 'Fill Rate (%)', value: loadingMetrics ? '...' : `${metrics?.solicitudesConOfertaPercent}%` },
          { label: 'Ofertas Aceptadas (%)', value: loadingMetrics ? '...' : `${metrics?.offerToAcceptPercent}%` },
          { label: 'Tiempo a Aceptación', value: loadingMetrics ? '...' : (metrics?.avgTimeToAccept != null ? `${metrics.avgTimeToAccept}d` : '—') },
          { label: 'GMV', value: loadingMetrics ? '...' : `Q${metrics?.gmv?.toLocaleString()}` },
          { label: 'Ticket Promedio', value: loadingMetrics ? '...' : `Q${metrics?.avgTicket?.toLocaleString()}` },
          { label: 'Take Rate (%)', value: loadingMetrics ? '...' : (metrics?.takeRatePercent != null ? `${metrics.takeRatePercent}%` : '—') },
          { label: 'Active Bancos', value: loadingMetrics ? '...' : metrics?.activeBancos },
          { label: 'Comisión Total', value: loadingMetrics ? '...' : `Q${metrics?.comisionTotal?.toLocaleString()}` },
        ].map((item) => (
          <div key={item.label} className="bg-white p-6 rounded-lg shadow flex flex-col">
            <span className="text-xs uppercase text-gray-500">{item.label}</span>
            <span className="mt-2 text-3xl font-semibold text-[#26B073]">{item.value}</span>
          </div>
        ))}
      </div>
      {/* Charts Mejorados */}
      {loadingGraficos ? (
        <div className="text-center text-gray-400 py-10">Cargando gráficos...</div>
      ) : (
        <GraficosDashboard
          metrics={metrics}
          historico={graficos?.historico || []}
          distribucion={graficos?.distribucion || []}
        />
      )}
      {/* Tabla de bancos */}
      {loadingBancos ? (
        <div className="text-center text-gray-400 py-10">Cargando bancos...</div>
      ) : (
        <BancosTable bancos={bancos} />
      )}
      {/* Tabla de solicitudes */}
      {loadingSolicitudes ? (
        <div className="text-center text-gray-400 py-10">Cargando solicitudes...</div>
      ) : (
        <SolicitudesTable solicitudes={solicitudes} />
      )}
      {/* Logs Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-[#0B1F3B]">Logs de Actividad</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#0B1F3B] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Actor</th>
              <th className="px-4 py-2 text-left">Acción</th>
              <th className="px-4 py-2 text-left">Entidad</th>
              <th className="px-4 py-2 text-left">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* TODO: map logs */}
            <tr>
              <td className="px-4 py-2" colSpan={5}>
                Sin datos
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
