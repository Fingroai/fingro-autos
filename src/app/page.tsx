'use client'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { PencilSquareIcon, BanknotesIcon, CheckBadgeIcon, TagIcon, CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const [precio, setPrecio] = useState(50000)
  const [enganche, setEnganche] = useState(10000)
  const [plazo, setPlazo] = useState(36)
  const [tasa, setTasa] = useState(12) // tasa anual en %

  const cuota = useMemo(() => {
    const principal = precio - enganche
    const r = (tasa / 100) / 12
    const n = plazo
    return ((principal * r) / (1 - Math.pow(1 + r, -n))).toFixed(2)
  }, [precio, enganche, plazo, tasa])

  return (
    <>
      <header className="sticky top-0 bg-white/70 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo_transparente.PNG" alt="Fingro logo" className="h-12 w-auto object-contain" style={{maxHeight:48}} />
            <h1 className="text-2xl font-bold text-[#0B1F3B]">Fingro Autos</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#calculate" className="text-gray-700 hover:text-[#26B073]">Calcula</a>
            <a href="#how" className="text-gray-700 hover:text-[#26B073]">Cómo funciona</a>
            <a href="#testimonials" className="text-gray-700 hover:text-[#26B073]">Testimonios</a>
            <a href="#faq" className="text-gray-700 hover:text-[#26B073]">FAQ</a>
          </nav>
          <div className="flex space-x-4">
            <Link href="/solicitud" className="px-4 py-2 bg-[#26B073] text-white rounded-md hover:bg-green-600 transition">
              Aplica
            </Link>
            <Link href="/login" className="px-4 py-2 border border-[#26B073] text-[#26B073] rounded-md hover:bg-[#26B073] hover:text-white transition">
              Ver mi solicitud
            </Link>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-br from-[#0B1F3B] to-[#062B4B] text-white overflow-hidden min-h-[50vh] flex items-center py-8 md:py-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-64 h-64 md:w-80 md:h-80 bg-[#26B073] opacity-20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-40 h-40 md:w-56 md:h-56 bg-[#F7C948] opacity-15 rounded-full mix-blend-multiply filter blur-2xl"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              Encuentra tu<br />
              financiamiento de auto<br />
              en menos de 48h
            </h1>
            <p className="text-base md:text-lg mb-4 md:mb-6 opacity-90">Financia vehículos nuevos o usados 100% digital. Sin comisiones ocultas.</p>
            <Link href="/solicitud" className="inline-block px-6 py-3 md:px-8 md:py-4 bg-[#26B073] rounded-md text-white font-semibold shadow-lg hover:bg-green-600 transition">
              Empieza ahora
            </Link>
            <p className="mt-2 text-xs md:text-sm opacity-80">100% digital • Sin comisiones</p>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img src="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80" alt="Sedán moderno" className="w-56 md:w-80 h-auto relative z-10 shadow-2xl rounded-2xl object-cover" />
          </div>
        </div>
      </section>

      <section id="calculate" className="py-6 bg-gray-50">
        <div className="container mx-auto px-0 md:px-4">
          <div className="rounded-xl overflow-hidden shadow max-w-5xl mx-auto">
            {/* Header azul */}
            <div className="bg-[#0B1F3B] px-4 py-3">
              <h2 className="text-xl font-bold text-white mb-0.5">Calcula tu crédito</h2>
              <p className="text-white/80 text-sm">Simula tu crédito y conoce la cuota mensual estimada</p>
            </div>
            {/* Grid principal */}
            <div className="bg-white p-0 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-14">
              {/* Columna izquierda: sliders/inputs */}
              <div className="p-4 md:p-4 space-y-6">
                {/* Monto */}
                <div className="bg-gray-50 rounded-lg px-2 py-2 flex flex-col gap-0.5 border border-gray-100">
                  <label className="block text-gray-900 font-medium mb-0.5 text-xs">Monto del crédito</label>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-400 text-[10px]">Q 5,000</span>
                    <span className="text-base font-bold text-[#0B1F3B]">Q {precio.toLocaleString()}</span>
                    <span className="text-gray-400 text-[10px]">Q 1,000,000</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="range" min={5000} max={1000000} step={1000} value={precio} onChange={e => setPrecio(+e.target.value)} className="w-full accent-[#26B073] h-1 rounded bg-gray-200" />
                    <input
  type="text"
  inputMode="numeric"
  pattern="[0-9,]*"
  value={precio.toLocaleString()}
  onChange={e => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setPrecio(raw ? +raw : 0);
  }}
  onBlur={e => {
    // Opcional: asegurar formato correcto al salir
    e.target.value = precio.toLocaleString();
  }}
  className="w-16 bg-gray-100 border-none rounded-md p-1 text-[#0B1F3B] text-right font-semibold focus:ring-2 focus:ring-[#26B073] focus:outline-none hide-arrows text-xs"
/>
                  </div>
                </div>
                {/* Enganche */}
                <div className="bg-gray-50 rounded-lg px-2 py-2 flex flex-col gap-0.5 border border-gray-100">
                  <label className="block text-gray-900 font-medium mb-0.5 text-xs">Enganche</label>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-400 text-[10px]">Q 0</span>
                    <span className="text-base font-bold text-[#0B1F3B]">Q {enganche.toLocaleString()}</span>
                    <span className="text-gray-400 text-[10px]">Q {precio.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="range" min={0} max={precio} step={500} value={enganche} onChange={e => setEnganche(+e.target.value)} className="w-full accent-[#26B073] h-1 rounded bg-gray-200" />
                    <input
  type="text"
  inputMode="numeric"
  pattern="[0-9,]*"
  value={enganche.toLocaleString()}
  onChange={e => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setEnganche(raw ? +raw : 0);
  }}
  onBlur={e => {
    e.target.value = enganche.toLocaleString();
  }}
  className="w-16 bg-gray-100 border-none rounded-md p-1 text-[#0B1F3B] text-right font-semibold focus:ring-2 focus:ring-[#26B073] focus:outline-none hide-arrows text-xs"
/>
                  </div>
                </div>
                {/* Plazo */}
                <div className="bg-gray-50 rounded-lg px-2 py-2 flex flex-col gap-0.5 border border-gray-100">
                  <label className="block text-gray-900 font-medium mb-0.5 text-xs">Plazo</label>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-400 text-[10px]">12 meses</span>
                    <span className="text-base font-bold text-[#0B1F3B]">{plazo} meses</span>
                    <span className="text-gray-400 text-[10px]">96 meses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="range" min={12} max={96} step={6} value={plazo} onChange={e => setPlazo(+e.target.value)} className="w-full accent-[#26B073] h-1 rounded bg-gray-200" />
                    <input type="number" min={12} max={96} step={6} value={plazo} onChange={e => setPlazo(+e.target.value)} className="w-16 bg-gray-100 border-none rounded-md p-1 text-[#0B1F3B] text-right font-semibold focus:ring-2 focus:ring-[#26B073] focus:outline-none hide-arrows text-xs" />
                  </div>
                </div>
                {/* Tasa */}
                <div className="bg-gray-50 rounded-lg px-2 py-2 flex flex-col gap-0.5 border border-gray-100">
                  <label className="block text-gray-900 font-medium mb-0.5 text-xs">Tasa de interés</label>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-400 text-[10px]">8%</span>
                    <span className="text-base font-bold text-green-600">{tasa.toFixed(1)}%</span>
                    <span className="text-gray-400 text-[10px]">25%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="range" min={8} max={25} step={0.1} value={tasa} onChange={e => setTasa(+e.target.value)} className="w-full accent-[#26B073] h-1 rounded bg-gray-200" />
                    <input type="number" min={8} max={25} step={0.1} value={tasa} onChange={e => setTasa(+e.target.value)} className="w-16 bg-gray-100 border-none rounded-md p-1 text-[#0B1F3B] text-right font-semibold focus:ring-2 focus:ring-[#26B073] focus:outline-none hide-arrows text-xs" />
                  </div>
                </div>
              </div>
              {/* Columna derecha: resumen */}
              <div className="bg-white p-6 md:p-8 flex flex-col justify-between min-h-[370px]">
                <div>
                  <h3 className="font-bold text-lg text-[#0B1F3B] mb-4">Resumen del crédito</h3>
                  <ul className="mb-4 space-y-1">
                    <li className="flex justify-between text-gray-700"><span>Monto del crédito:</span> <span className="font-semibold">Q {precio.toLocaleString()}</span></li>
                    <li className="flex justify-between text-gray-700"><span>Enganche:</span> <span className="font-semibold">Q {enganche.toLocaleString()}</span></li>
                    <li className="flex justify-between text-gray-700"><span>Plazo:</span> <span className="font-semibold">{plazo} meses</span></li>
                    <li className="flex justify-between text-gray-700"><span>Tasa de interés anual:</span> <span className="font-semibold text-green-600">{tasa.toFixed(1)}%</span></li>
                  </ul>
                  <div className="flex items-center justify-between border-t pt-4 mt-4">
                    <span className="text-gray-700 font-semibold">Cuota mensual estimada:</span>
                    <span className="text-2xl md:text-3xl font-bold text-[#0B1F3B]">Q {Number(cuota).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* Esta es una simulación. La cuota final puede variar según evaluación.</p>
                </div>
                <div className="mt-6">
                  <Link href="/solicitud">
                    <button className="w-full bg-[#26B073] hover:bg-[#229a65] text-white font-semibold py-3 rounded-lg shadow transition">Solicitar este crédito</button>
                  </Link>
                  <p className="text-xs text-gray-500 text-center mt-2">Sin compromiso, consulta gratis las ofertas disponibles para ti</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="py-20 bg-[#0B1F3B]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-4">¿Cómo funciona Fingro Autos?</h2>
          <p className="text-lg text-center text-white mb-10">Hacemos que el proceso de obtener tu crédito automotriz sea <span className="font-semibold text-[#26B073]">fácil, rápido y sin complicaciones</span>.</p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-stretch max-w-5xl mx-auto">
            {/* Paso 1 */}
            <div className="relative flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg px-8 py-10 md:py-12 w-full h-full text-center transition-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4">
                <div className="bg-[#26B073] text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl border-4 border-[#E5F6F1] shadow mx-auto">1</div>
              </div>
              <h3 className="text-xl font-bold text-[#26B073] mb-2">Completa el formulario</h3>
              <p className="text-[#0B1F3B] text-base">Llena tu información y tus documentos de forma rápida y segura.</p>
            </div>
            {/* Paso 2 */}
            <div className="relative flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg px-8 py-10 md:py-12 w-full h-full text-center transition-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4">
                <div className="bg-[#26B073] text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl border-4 border-[#E5F6F1] shadow mx-auto">2</div>
              </div>
              <h3 className="text-xl font-bold text-[#26B073] mb-2">Compara ofertas</h3>
              <p className="text-[#0B1F3B] text-base">Recibe propuestas de diferentes bancos y compara fácilmente condiciones y mensualidades.</p>
            </div>
            {/* Paso 3 */}
            <div className="relative flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg px-8 py-10 md:py-12 w-full h-full text-center transition-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4">
                <div className="bg-[#26B073] text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl border-4 border-[#E5F6F1] shadow mx-auto">3</div>
              </div>
              <h3 className="text-xl font-bold text-[#26B073] mb-2">Elige la mejor y compra tu carro</h3>
              <p className="text-[#0B1F3B] text-base">Acepta la oferta ideal y estrena tu auto nuevo, todo 100% digital.</p>
            </div>
          </div>
        </div>
        {/* CTA debajo de las cards */}
        <div className="flex justify-center mt-10">
          <a href="/solicitud" className="px-8 py-4 bg-[#26B073] text-white rounded-md font-semibold text-lg shadow-lg hover:bg-green-600 transition">
            Solicita tu crédito ahora
          </a>
        </div>
      </section>

      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Lo que dicen nuestros clientes</h2>
          <div className="relative">
            {/* Flecha izquierda */}
            <button
              aria-label="Anterior"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-[#26B073] hover:text-white text-[#0B1F3B] rounded-full shadow-lg p-2 transition hidden md:block"
              onClick={() => {
                document.getElementById('testimonial-carousel')?.scrollBy({ left: -350, behavior: 'smooth' });
              }}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            {/* Carrusel */}
            <div id="testimonial-carousel" className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-10 md:gap-14 snap-x snap-mandatory pb-4">
                {/* Testimonios */}
                {[
                  { nombre: "Ana González", texto: "Gracias a Fingro Autos obtuve el mejor financiamiento para mi carro en horas." },
                  { nombre: "Luis Mendoza", texto: "Proceso simple y transparente. ¡Lo recomiendo!" },
                  { nombre: "María López", texto: "Me sorprendió lo rápido que recibí ofertas." },
                  { nombre: "Carlos Ruiz", texto: "El trámite fue sencillo y todo digital, sin complicaciones." },
                  { nombre: "Paola Herrera", texto: "Me ayudaron a comparar varias opciones y elegir la mejor." },
                  { nombre: "Jorge Ramírez", texto: "Excelente atención y seguimiento durante todo el proceso." },
                  { nombre: "Gabriela Díaz", texto: "Nunca pensé que fuera tan rápido conseguir financiamiento." },
                  { nombre: "Ricardo Castillo", texto: "Muy recomendado para quienes buscan transparencia y rapidez." },
                ].map((t, i) => (
                  <div key={i} className="min-w-[360px] max-w-[460px] md:min-w-[420px] md:max-w-[520px] bg-white border border-[#0B1F3B]/10 shadow-lg snap-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col items-center mx-auto rounded-xl p-9">
  <span className="font-bold text-[#26B073] text-base md:text-lg mb-2 text-center w-full">{t.nombre}</span>
  <svg className="w-5 h-5 text-[#26B073] mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 17c0-4.418 3.582-8 8-8V7a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2c4.418 0 8 3.582 8 8z" />
  </svg>
  <p className="italic text-[#0B1F3B] text-base md:text-lg text-center leading-relaxed">“{t.texto}”</p>
</div>
                ))}
              </div>
            </div>
            {/* CTA debajo del carrusel */}
            <div className="flex flex-col items-center mt-10">
              <a href="#calculate" className="inline-block bg-[#26B073] text-white text-lg md:text-xl font-bold px-10 py-4 rounded-full shadow-lg hover:bg-[#179764] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0B1F3B] focus:ring-offset-2">
                Solicita tu crédito ahora
              </a>
            </div>
            {/* Flecha derecha */}
            <button
              aria-label="Siguiente"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-[#26B073] hover:text-white text-[#0B1F3B] rounded-full shadow-lg p-2 transition hidden md:block"
              onClick={() => {
                document.getElementById('testimonial-carousel')?.scrollBy({ left: 350, behavior: 'smooth' });
              }}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-2xl space-y-4">
          <h2 className="text-3xl font-bold text-center mb-8">Preguntas frecuentes</h2>
          {[
            {
              q: "¿Cómo inicio mi solicitud?",
              a: "Haz clic en 'Aplica' y completa el formulario con tus datos básicos y del vehículo que deseas financiar."
            },
            {
              q: "¿Cuánto tarda el proceso?",
              a: "Normalmente recibes ofertas de los bancos en menos de 48 horas hábiles."
            },
            {
              q: "¿Qué documentos necesito?",
              a: "DPI, comprobante de ingresos, y opcional recibo de servicio reciente. Puedes subirlos desde el panel."
            },
            {
              q: "¿Puedo financiar un carro usado?",
              a: "Sí, puedes solicitar financiamiento tanto para autos nuevos como usados, según las políticas del banco."
            },
            {
              q: "¿Cuánto es el enganche mínimo?",
              a: "El enganche mínimo varía según el banco, pero normalmente es del 10% al 20% del valor del vehículo."
            },
            {
              q: "¿Qué pasa si no acepto ninguna oferta?",
              a: "No hay compromiso: puedes rechazar todas las ofertas y tus datos no serán compartidos con ningún banco."
            },
            {
              q: "¿Mis datos son seguros?",
              a: "Sí, Fingro cumple con las normas de protección de datos y solo comparte tu información con el banco que tú elijas."
            },
            {
              q: "¿Puedo adelantar pagos o cancelar el crédito antes?",
              a: "Sí, la mayoría de bancos permiten pagos anticipados o cancelación anticipada, consulta las condiciones de cada oferta."
            }
          ].map((item, idx) => (
            <details
              key={idx}
              className="group border rounded-xl bg-white shadow-sm transition-all overflow-hidden">
              <summary className="flex items-center justify-between font-semibold text-[#0B1F3B] cursor-pointer px-5 py-4 text-base md:text-lg select-none group-open:border-[#26B073] group-open:border-l-4 group-open:bg-[#F5FCF9] group-open:shadow-lg">
                {item.q}
                <svg className="w-5 h-5 ml-2 text-[#26B073] transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-4 pt-1 text-gray-700 text-base leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section id="cta" className="w-full py-10 px-4 flex justify-center">
        <div className="bg-white shadow-lg rounded-xl md:rounded-2xl px-4 md:px-16 py-8 md:py-12 flex flex-col items-center max-w-3xl w-full">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[#0B1F3B]">¿Listo para encontrar tu crédito ideal?</h2>
          <p className="text-gray-700 mb-6 max-w-xl mx-auto text-base md:text-lg">Completa el formulario y recibe ofertas personalizadas de múltiples bancos en menos de 48 horas.</p>
          <a href="/solicitud" className="inline-flex items-center gap-2 bg-[#26B073] text-white text-base md:text-lg font-bold px-10 py-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0B1F3B] focus:ring-offset-2">
            Solicita tu crédito ahora
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </section>

      <footer className="bg-[#0B1F3B] pt-12 pb-10 mt-12">
  <div className="max-w-4xl mx-auto px-6 flex flex-col items-center gap-6">
    <div className="font-bold text-2xl md:text-3xl text-[#26B073]">Fingro</div>
    <div className="text-gray-300 text-base md:text-lg text-center max-w-2xl">
      Financiamiento vehicular 100% digital. Recibe ofertas de varios bancos y elige la mejor opción para ti.
    </div>
    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-6 mt-4">
      <div className="flex flex-col gap-2 md:gap-0 md:flex-row md:items-center md:space-x-4 justify-center md:justify-start">
        <span className="text-sm text-gray-200"> 2025 Fingro Autos. Todos los derechos reservados.</span>
        <span className="hidden md:inline text-gray-500">·</span>
        <a href="#" className="text-sm text-gray-300 hover:text-[#26B073] transition-colors">Términos</a>
        <span className="hidden md:inline text-gray-500">·</span>
        <a href="#" className="text-sm text-gray-300 hover:text-[#26B073] transition-colors">Privacidad</a>
      </div>
      <div className="flex justify-center items-center gap-5 mt-4 md:mt-0">
        <a href="https://www.instagram.com/fingro.gt/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-300 hover:text-[#26B073] transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
          </svg>
        </a>
        <a href="https://x.com/FingroAI" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-gray-300 hover:text-[#26B073] transition-colors">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4L20 20M20 4L4 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </a>
        <a href="mailto:sebastian@fingroai.com" aria-label="Correo" className="text-gray-300 hover:text-[#26B073] transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </a>
        <a href="mailto:sebastian@fingroai.com" className="text-sm text-gray-300 hover:text-[#26B073] transition-colors">sebastian@fingroai.com</a>
      </div>
    </div>
  </div>
</footer>
    </>
  )
}
