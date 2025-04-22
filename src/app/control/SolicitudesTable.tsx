"use client";
import React, { useState } from "react";

function formatFecha(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("es-GT", { year: "2-digit", month: "short", day: "2-digit" });
}


function SolicitudDetalleModal({ solicitud, onClose }: { solicitud: any, onClose: () => void }) {
  const [tab, setTab] = useState<'personales'|'vehiculo'|'financieros'|'documentos'>('personales');
  if (!solicitud) return null;
  // Agrupar campos
  const personales = [
    { label: "Nombre", value: solicitud.nombre },
    { label: "DPI", value: solicitud.dpi },
    { label: "NIT", value: solicitud.nit },
    { label: "Fecha nacimiento", value: solicitud.fecha_nacimiento },
    { label: "Teléfono", value: solicitud.telefono },
    { label: "Correo", value: solicitud.correo },
    { label: "Departamento", value: solicitud.departamento },
    { label: "Municipio", value: solicitud.municipio },
    { label: "Dirección", value: solicitud.direccion }
  ];
  const vehiculo = [
    { label: "Tipo", value: solicitud.tipo_vehiculo },
    { label: "¿Nuevo?", value: solicitud.vehiculo_nuevo ? "Sí" : "No" },
    { label: "Marca/Modelo/Año", value: solicitud.marca_modelo_anio },
    { label: "Precio", value: solicitud.precio ? `Q${solicitud.precio.toLocaleString()}` : "-" },
    { label: "Enganche", value: solicitud.enganche ? `Q${solicitud.enganche.toLocaleString()}` : "-" },
    { label: "Monto a financiar", value: solicitud.monto_financiar ? `Q${solicitud.monto_financiar.toLocaleString()}` : "-" },
    { label: "Plazo", value: solicitud.plazo }
  ];
  const financieros = [
    { label: "Estado laboral", value: solicitud.estado_laboral },
    { label: "Ocupación", value: solicitud.ocupacion },
    { label: "Empresa", value: solicitud.empresa },
    { label: "Ingresos", value: solicitud.ingresos ? `Q${solicitud.ingresos.toLocaleString()}` : "-" },
    { label: "¿Tiene otras deudas?", value: solicitud.tiene_deudas ? "Sí" : "No" },
    { label: "Monto deuda", value: solicitud.monto_deuda ? `Q${solicitud.monto_deuda.toLocaleString()}` : "-" },
    { label: "Cuota deuda", value: solicitud.cuota_deuda ? `Q${solicitud.cuota_deuda.toLocaleString()}` : "-" }
  ];
  const docs = solicitud.documentos ? Object.entries(solicitud.documentos).map(([k,v]) => ({ label: k, value: v })) : [];
  const tabs = [
    { id: 'personales', label: 'Personales', icon: '👤', content: personales },
    { id: 'vehiculo', label: 'Vehículo', icon: '🚗', content: vehiculo },
    { id: 'financieros', label: 'Financieros', icon: '💼', content: financieros },
    { id: 'documentos', label: 'Documentos', icon: '📄', content: docs }
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-0 flex flex-col md:flex-row relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-[#26B073] text-3xl font-bold focus:outline-none"
          aria-label="Cerrar"
        >×</button>
        <div className="flex flex-row md:flex-col border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50 min-w-[120px]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex items-center gap-2 px-4 py-3 md:py-4 w-full text-left text-sm font-semibold border-b-2 md:border-b-0 md:border-r-4 transition-colors ${tab === t.id ? 'border-[#26B073] text-[#26B073] bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 p-6 overflow-auto max-h-[80vh]">
          <h4 className="text-xl font-bold mb-4 text-[#0B1F3B]">{tabs.find(t => t.id === tab)?.label}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-base">
            {tab !== 'documentos' && tabs.find(t => t.id === tab)?.content.map((f: any) => (
              <React.Fragment key={f.label}>
                <div className="font-semibold text-gray-600">{f.label}</div>
                <div className="break-words">{f.value || '-'}</div>
              </React.Fragment>
            ))}
            {tab === 'documentos' && docs.length > 0 && docs.map(f => (
              <React.Fragment key={f.label}>
                <div className="font-semibold text-gray-600">{f.label}</div>
                <div>{typeof f.value === 'string' ? <a href={f.value} target="_blank" rel="noopener noreferrer" className="text-[#26B073] underline">Ver documento</a> : '-'}</div>
              </React.Fragment>
            ))}
            {tab === 'documentos' && docs.length === 0 && <div className="text-gray-400 col-span-2">Sin documentos</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SolicitudesTable({ solicitudes = [] }) {
  const [detalle, setDetalle] = useState<any>(null);
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4 text-[#0B1F3B]">Solicitudes</h3>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-[#26B073] text-white">
          <tr>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Monto pedido</th>
            <th className="px-4 py-2 text-left">Enganche</th>
            <th className="px-4 py-2 text-left">Plazo</th>
            <th className="px-4 py-2 text-left">Tipo</th>
            <th className="px-4 py-2 text-left">¿Nuevo?</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Fecha</th>
            <th className="px-4 py-2 text-left">Etapa</th>
            <th className="px-4 py-2 text-left">Detalle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {solicitudes.length === 0 ? (
            <tr><td colSpan={9} className="text-center py-8 text-gray-400">Sin solicitudes registradas</td></tr>
          ) : solicitudes.map((s: any) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{s.nombre || '-'}</td>
              <td className="px-4 py-2">Q{s.monto_financiar?.toLocaleString() || s.precio?.toLocaleString() || '-'}</td>
              <td className="px-4 py-2">Q{s.enganche?.toLocaleString() || '-'}</td>
              <td className="px-4 py-2">{s.plazo || '-'}</td>
              <td className="px-4 py-2">{s.tipo_vehiculo || '-'}</td>
              <td className="px-4 py-2">{s.vehiculo_nuevo ? 'Sí' : 'No'}</td>
              <td className="px-4 py-2">{s.estado_laboral || '-'}</td>
              <td className="px-4 py-2">{formatFecha(s.created_at)}</td>
              <td className="px-4 py-2">
                <span
                  className={
                    `inline-block px-2 py-1 rounded-full text-xs font-semibold `+
                    (s.etapa === 'Solicitud enviada' ? 'bg-gray-200 text-gray-700' :
                     s.etapa === 'Oferta enviada' ? 'bg-blue-100 text-blue-700' :
                     s.etapa === 'Oferta aceptada' ? 'bg-yellow-100 text-yellow-700' :
                     s.etapa === 'Desembolso' ? 'bg-green-100 text-green-700' :
                     'bg-gray-100 text-gray-700')
                  }
                >
                  {s.etapa}
                </span>
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => setDetalle(s)}
                  className="flex items-center gap-1 px-3 py-1 bg-[#26B073] hover:bg-[#0B1F3B] text-white rounded shadow text-xs font-semibold transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {detalle && <SolicitudDetalleModal solicitud={detalle} onClose={() => setDetalle(null)} />}
    </div>
  );
}

