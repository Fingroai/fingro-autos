"use client";
import React from "react";

export default function BancosTable({ bancos = [] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4 text-[#0B1F3B]">Bancos y KPIs</h3>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-[#0B1F3B] text-white">
          <tr>
            <th className="px-4 py-2 text-left">Logo</th>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Correo</th>
            <th className="px-4 py-2 text-left">Ofertas Enviadas</th>
            <th className="px-4 py-2 text-left">Aceptadas (%)</th>
            <th className="px-4 py-2 text-left">Desembolsadas (%)</th>
            <th className="px-4 py-2 text-left">GMV</th>
            <th className="px-4 py-2 text-left">Comisión</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bancos.length === 0 ? (
            <tr><td colSpan={8} className="text-center py-8 text-gray-400">Sin bancos registrados</td></tr>
          ) : bancos.map((banco:any) => (
            <tr key={banco.id} className="hover:bg-gray-50">
              <td className="px-4 py-2"><img src={banco.logo_url} alt={banco.nombre} className="w-10 h-10 rounded-full bg-gray-100 object-contain" /></td>
              <td className="px-4 py-2 font-semibold text-[#0B1F3B]">{banco.nombre}</td>
              <td className="px-4 py-2">{banco.correo}</td>
              <td className="px-4 py-2">{banco.ofertasEnviadas}</td>
              <td className="px-4 py-2">{banco.tasaAceptacion}%</td>
              <td className="px-4 py-2">{banco.tasaDesembolso}%</td>
              <td className="px-4 py-2">Q{banco.gmv?.toLocaleString()}</td>
              <td className="px-4 py-2">Q{banco.comision?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
