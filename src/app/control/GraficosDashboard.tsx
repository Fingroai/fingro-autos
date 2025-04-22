"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

const COLORS = ["#26B073", "#0B1F3B", "#FFD600", "#FF6B6B", "#A259FF"];

export default function GraficosDashboard({ metrics, historico = [], distribucion = [] }) {
  // Ejemplo de datos si no se pasan props
  historico = historico.length ? historico : [
    { mes: "Ene", solicitudes: 40, ofertas: 30, aceptadas: 15, desembolsadas: 8, comision: 1200 },
    { mes: "Feb", solicitudes: 60, ofertas: 40, aceptadas: 25, desembolsadas: 10, comision: 1500 },
    { mes: "Mar", solicitudes: 80, ofertas: 55, aceptadas: 30, desembolsadas: 20, comision: 2500 },
  ];
  distribucion = distribucion.length ? distribucion : [
    { name: "Nuevo", value: 65 },
    { name: "Usado", value: 35 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Embudo: Solicitudes → Ofertas → Aceptadas → Desembolsadas */}
      <div className="bg-white p-6 rounded-lg shadow flex flex-col">
        <h4 className="text-md font-semibold mb-2 text-[#0B1F3B]">Embudo Marketplace</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={historico} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="solicitudes" fill="#26B073" name="Solicitudes" />
            <Bar dataKey="ofertas" fill="#FFD600" name="Ofertas" />
            <Bar dataKey="aceptadas" fill="#0B1F3B" name="Aceptadas" />
            <Bar dataKey="desembolsadas" fill="#A259FF" name="Desembolsadas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Distribución por tipo de vehículo */}
      <div className="bg-white p-6 rounded-lg shadow flex flex-col">
        <h4 className="text-md font-semibold mb-2 text-[#0B1F3B]">Distribución Vehículo</h4>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={distribucion}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
            >
              {distribucion.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Comisión generada por mes */}
      <div className="bg-white p-6 rounded-lg shadow flex flex-col col-span-1 md:col-span-2">
        <h4 className="text-md font-semibold mb-2 text-[#0B1F3B]">Comisión Generada (Q)</h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={historico} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="comision" stroke="#26B073" name="Comisión" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
