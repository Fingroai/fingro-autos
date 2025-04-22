"use client";
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

// UX/UI enhancements

export default function PanelPage() {
  const [solicitud, setSolicitud] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [loadingOfertas, setLoadingOfertas] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [acceptingOffer, setAcceptingOffer] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, Record<string,string>>>({});

  // Función para obtener el nombre del banco desde la relación
  const getBancoNombre = (of: any) => Array.isArray(of.bancos) ? of.bancos[0]?.nombre : of.bancos?.nombre;

  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  useEffect(() => {
    const init = async () => {
      let sol;
      if (idParam) {
        const res = await fetch(`/api/solicitudes?id=${idParam}`);
        sol = await res.json();
      } else {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error(sessionError);
          setLoading(false);
          setLoadingOfertas(false);
          return;
        }
        const emailUser = session?.user?.email;
        if (!emailUser) {
          setLoading(false);
          setLoadingOfertas(false);
          return;
        }
        const resSol = await fetch(`/api/solicitudes?correo=${encodeURIComponent(emailUser)}`);
        sol = await resSol.json();
      }
      setSolicitud(sol);
      setLoading(false);
      if (sol?.id) {
        const resOf = await fetch(`/api/ofertas?solicitudId=${sol.id}`);
        const ofData = await resOf.json();
        setOfertas(ofData);
      }
      setLoadingOfertas(false);
    };
    init();
  }, [idParam]);

  const handleAcceptOffer = async () => {
    if (!selectedOffer?.id || !solicitud?.id) return;
    setAcceptingOffer(true);
    try {
      const res = await fetch('/api/ofertas/aceptar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solicitudId: solicitud.id, ofertaId: selectedOffer.id }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = await fetch(`/api/ofertas?solicitudId=${solicitud.id}`).then(r => r.json());
        setOfertas(updated);
        setSelectedOffer(null);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAcceptingOffer(false);
    }
  };

  const handleFileUpload = async (ofertaId: string, docName: string, file: File) => {
    const ext = file.name.split('.').pop();
    const filePath = `ofertas/${ofertaId}/${docName}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('ofertas-docs').upload(filePath, file, { upsert: true });
    if (error) { console.error(error); return; }
    const { publicUrl } = supabase.storage.from('ofertas-docs').getPublicUrl(filePath).data;
    setUploadedDocs(prev => ({ ...prev, [ofertaId]: { ...(prev[ofertaId]||{}), [docName]: publicUrl } }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-[#26B073] rounded-full animate-spin"></div>
    </div>
  );

  if (!solicitud) return (
    <div className="max-w-md mx-auto text-center text-gray-500 mt-10">
      No se encontró la solicitud.
    </div>
  );

  const {
    documentos,
    monto_financiar,
    etapa, // <- nuevo campo, si existe
    estado,
    vehiculo_nuevo,
    tipo_vehiculo,
    marca_modelo_anio,
    precio,
    enganche,
    plazo,
    nombre,
    dpi,
    nit,
    fecha_nacimiento,
    telefono,
    correo,
    departamento,
    municipio,
    direccion,
    estado_laboral,
    ocupacion,
    empresa,
    ingresos,
    tiene_deudas,
    monto_deuda,
    cuota_deuda
  } = solicitud;

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <header className="max-w-3xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold text-[#0B1F3B]">Mi Panel de Solicitud</h1>
        <p className="mt-1 text-gray-600">Revisa el estado y detalles de tu solicitud.</p>
      </header>
      <div className="max-w-3xl mx-auto mt-6 bg-white shadow-lg border-l-4 border-[#26B073] rounded-lg">
        <button onClick={() => setShowSummary(prev => !prev)} className="w-full flex justify-between items-center p-6">
          <h2 className="text-2xl font-bold text-[#0B1F3B]">Resumen de tu solicitud</h2>
          <span className="text-2xl font-bold text-[#0B1F3B]">{showSummary ? "−" : "+"}</span>
        </button>
        {showSummary && (
          <div className="p-6 pt-0">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 [&_dt]:text-[#26B073] [&_dt]:font-semibold [&_dt]:uppercase [&_dd]:text-gray-900 [&_dd]:mt-1 [&_dd]:font-medium">
              <div><dt className="font-medium">Estado del vehículo</dt><dd>{vehiculo_nuevo === 'nuevo' ? 'Nuevo' : 'Usado'}</dd></div>
              <div><dt className="font-medium">Tipo de vehículo</dt><dd>{tipo_vehiculo}</dd></div>
              <div><dt className="font-medium">Modelo</dt><dd>{marca_modelo_anio}</dd></div>
              <div><dt className="font-medium">Precio</dt><dd>Q {precio?.toLocaleString() || "-"}</dd></div>
              <div><dt className="font-medium">Enganche</dt><dd>Q {enganche?.toLocaleString() || "-"}</dd></div>
              <div><dt className="font-medium">Plazo</dt><dd>{plazo} meses</dd></div>
              <div><dt className="font-medium">Nombre</dt><dd>{nombre}</dd></div>
              <div><dt className="font-medium">DPI</dt><dd>{dpi}</dd></div>
              <div><dt className="font-medium">NIT</dt><dd>{nit}</dd></div>
              <div><dt className="font-medium">Nacimiento</dt><dd>{fecha_nacimiento}</dd></div>
              <div><dt className="font-medium">Teléfono</dt><dd>{telefono}</dd></div>
              <div><dt className="font-medium">Correo</dt><dd>{correo}</dd></div>
              <div><dt className="font-medium">Dirección</dt><dd>{`${departamento}, ${municipio}, ${direccion}`}</dd></div>
              <div><dt className="font-medium">Estado laboral</dt><dd>{estado_laboral}</dd></div>
              <div><dt className="font-medium">Ocupación</dt><dd>{ocupacion}</dd></div>
              <div><dt className="font-medium">Empresa</dt><dd>{empresa}</dd></div>
              <div><dt className="font-medium">Ingresos</dt><dd>Q {ingresos?.toLocaleString() || "-"}</dd></div>
              {tiene_deudas && <div><dt className="font-medium">Otras deudas</dt><dd>Q {monto_deuda?.toLocaleString()}</dd></div>}
              {tiene_deudas && <div><dt className="font-medium">Cuota de deudas</dt><dd>Q {cuota_deuda?.toLocaleString()}</dd></div>}
            </dl>
          </div>
        )}
      </div>
      <section className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white shadow-lg border-l-4 border-[#26B073] rounded-lg p-6 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-[#26B073] mb-2">Estado</h2>
          <p className="text-2xl font-extrabold text-gray-900">{estado || "En revisión"}</p>
        </div>
        <div className="bg-white shadow-lg border-l-4 border-[#26B073] rounded-lg p-6 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-[#26B073] mb-2">Monto a financiar</h2>
          <p className="text-2xl font-extrabold text-gray-900">Q {monto_financiar?.toLocaleString()}</p>
        </div>
      </section>
      <section className="max-w-3xl mx-auto mt-8 bg-white shadow-lg border-l-4 border-[#F7C948] rounded-lg p-6">
        <h3 className="text-xl font-semibold text-[#0B1F3B] mb-4">Documentos</h3>
        <ul className="space-y-3">
          {documentos && Object.entries(documentos).map(([key, url]) => (
            <li key={key} className="bg-gray-100 rounded-md p-3 flex items-center space-x-2">
              <span className="text-[#26B073]">{key.includes("docDpi") ? "📄" : "📑"}</span>
              <a href={url as string} target="_blank" className="text-[#0B1F3B] font-medium hover:underline">
                {key.replace("doc", "").toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="max-w-3xl mx-auto mt-8 bg-white shadow-lg border-l-4 border-gray-300 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-[#0B1F3B] mb-4">Ofertas</h3>
        {loadingOfertas ? (
          <div className="flex justify-center py-8">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-[#26B073] rounded-full animate-spin"></div>
          </div>
        ) : ofertas.length ? (
          <div className="space-y-4">
            {ofertas.map((oferta) => (
              <div key={oferta.id} className="bg-white shadow rounded-lg p-4 space-y-2 border-l-4 border-[#26B073]">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-[#0B1F3B]">{getBancoNombre(oferta) || oferta.banco_id}</p>
                  <p className="text-sm text-gray-500">Enviado: {new Date(oferta.created_at).toLocaleDateString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  <p><strong>Monto:</strong> Q {oferta.monto?.toLocaleString()}</p>
                  <p><strong>Plazo:</strong> {oferta.plazo} meses</p>
                  <p><strong>Tasa:</strong> {oferta.tasa_interes}%</p>
                  <p><strong>Cuota:</strong> Q {oferta.cuota?.toLocaleString()}</p>
                </div>
                {oferta.documentos_requeridos?.length > 0 && (
                  <div className="mt-2">
                    <strong>Documentos requeridos:</strong>
                    {oferta.documentos_requeridos.map((doc: string) => (
                      <div key={doc} className="mt-1 flex flex-col">
                        <label className="text-sm font-medium text-gray-600">{doc}</label>
                        <input type="file" accept=".pdf,image/*" onChange={e => e.target.files?.[0] && handleFileUpload(oferta.id, doc, e.target.files[0])} className="mt-1"/>
                        {uploadedDocs[oferta.id]?.[doc] && (
                          <a href={uploadedDocs[oferta.id][doc]} target="_blank" className="text-blue-500 text-sm mt-1">Ver archivo</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {oferta.aceptada ? (
                  <button disabled className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded w-full">Aceptada</button>
                ) : (
                  <button onClick={() => setSelectedOffer(oferta)} className="mt-4 px-4 py-2 bg-[#26B073] text-white rounded w-full">Ver detalles</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">Aún no hay ofertas disponibles.</p>
        )}
      </section>
      {selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-[#0B1F3B]">Detalles de la Oferta</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-700 mb-4">
              <div>
                <p><strong>Banco:</strong> {getBancoNombre(selectedOffer) || selectedOffer.banco_id}</p>
                <p><strong>Enviado:</strong> {new Date(selectedOffer.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p><strong>Monto a financiar:</strong> Q {selectedOffer.monto?.toLocaleString()}</p>
                <p><strong>Tasa:</strong> {selectedOffer.tasa_interes}%</p>
              </div>
              <div>
                <p><strong>Plazo:</strong> {selectedOffer.plazo} meses</p>
                <p><strong>Cuota:</strong> Q {selectedOffer.cuota?.toLocaleString() || '-'}</p>
              </div>
              <div className="col-span-2">
                <p><strong>Comentarios:</strong> {selectedOffer.comentarios || selectedOffer.comments}</p>
              </div>
            </div>
            {selectedOffer.documentos_requeridos?.length > 0 && (
              <div className="mt-4">
                <strong>Documentos requeridos:</strong>
                <div className="space-y-4 mt-2">
                  {selectedOffer.documentos_requeridos.map((doc: string) => (
                    <div key={doc} className="flex flex-col space-y-1">
                      <span className="text-gray-700 font-medium">{doc}</span>
                      <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#26B073]">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={e => e.target.files?.[0] && handleFileUpload(selectedOffer.id, doc, e.target.files[0])}
                        />
                        <span className="text-sm text-gray-500">Haz click o arrastra para subir</span>
                      </label>
                      {uploadedDocs[selectedOffer.id]?.[doc] && (
                        <a href={uploadedDocs[selectedOffer.id][doc]} target="_blank" className="text-blue-500 text-sm">Ver archivo subido</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={() => setSelectedOffer(null)} className="px-4 py-2 bg-gray-300 rounded">Cerrar</button>
              {selectedOffer.aceptada ? (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded">Oferta aceptada</span>
              ) : (
                <button disabled={acceptingOffer} onClick={handleAcceptOffer} className="px-4 py-2 bg-[#26B073] text-white rounded">
                  {acceptingOffer ? 'Aceptando...' : 'Aceptar oferta'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
