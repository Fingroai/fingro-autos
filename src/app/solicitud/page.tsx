"use client";
import React, { useState, createRef } from "react";
import { useRouter } from 'next/navigation';
import { DEPARTAMENTOS } from '../../lib/departamentos';

// Branding colors
const PRIMARY = "#0B1F3B";
const ACCENT = "#26B073";
const YELLOW = "#F7C948";

const steps = [
  "Datos del vehículo",
  "Datos personales",
  "Datos laborales",
  "Ingresos y deudas",
  "Documentos",
  "Términos",
  "Resumen"
];

// Estado del formulario con tipos correctos
type FormState = {
  vehiculoNuevo: "nuevo" | "usado";
  tipoVehiculo: string;
  marcaModeloAnio: string;
  precio: string;
  enganche: string;
  plazo: string;
  nombre: string;
  dpi: string;
  nit: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
  departamento: string;
  municipio: string;
  direccion: string;
  estadoLaboral: string;
  ocupacion: string;
  empresa: string;
  antiguedad: string;
  ingresos: string;
  tieneDeudas: string;
  montoDeuda: string;
  cuotaDeuda: string;
  docDpi: File | null;
  docIngresos: File | null;
  docRecibo: File | null;
  aceptaTerminos: boolean;
};

export default function SolicitudPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    // Paso 1: Vehículo
    vehiculoNuevo: "nuevo",
    tipoVehiculo: "",
    marcaModeloAnio: "",
    precio: "",
    enganche: "",
    plazo: "",
    // Paso 2: Personales
    nombre: "",
    dpi: "",
    nit: "",
    fechaNacimiento: "",
    telefono: "",
    correo: "",
    departamento: "",
    municipio: "",
    direccion: "",
    // Paso 3: Laboral
    estadoLaboral: "",
    ocupacion: "",
    empresa: "",
    antiguedad: "",
    // Paso 4: Ingresos/deudas
    ingresos: "",
    tieneDeudas: "no",
    montoDeuda: "",
    cuotaDeuda: "",
    // Paso 5: Documentos
    docDpi: null,
    docIngresos: null,
    docRecibo: null,
    // Paso 6: Términos
    aceptaTerminos: false
  });
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Errores de validación y helper para clases
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const getClass = (field: keyof FormState) => `${INPUT_CLASS} ${errors[field] ? 'border-red-500' : ''}`;

  // UI helpers
  const update = (key: keyof FormState, value: FormState[keyof FormState]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: false }));
  };
  const handleChange = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    update(key, e.target.value as any);
  };
  // Estilo uniforme para inputs y selects
  const INPUT_CLASS = "w-full p-4 border border-[#0B1F3B] rounded-lg text-[#0B1F3B] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#26B073] focus:border-[#26B073]";

  // Helpers para formateo de moneda
  const formatMoney = (v: string) => v ? 'Q ' + v.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  const handleMoneyChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    update(key, raw);
  };

  // Validación por paso (resalta errores en rojo)
  const validateStep = (s: number) => {
    const newErrors: Partial<Record<keyof FormState, boolean>> = {};
    if (s === 0) {
      if (!form.tipoVehiculo) newErrors.tipoVehiculo = true;
      if (!form.marcaModeloAnio) newErrors.marcaModeloAnio = true;
      if (!form.precio) newErrors.precio = true;
      if (!form.enganche) newErrors.enganche = true;
      if (!form.plazo) newErrors.plazo = true;
    }
    if (s === 1) {
      if (!form.nombre) newErrors.nombre = true;
      if (!form.dpi) newErrors.dpi = true;
      if (!form.nit) newErrors.nit = true;
      if (!form.fechaNacimiento) newErrors.fechaNacimiento = true;
      if (!form.telefono) newErrors.telefono = true;
      if (!form.correo) newErrors.correo = true;
      if (!form.departamento) newErrors.departamento = true;
      if (!form.municipio) newErrors.municipio = true;
      if (!form.direccion) newErrors.direccion = true;
    }
    if (s === 2) {
      if (!form.estadoLaboral) newErrors.estadoLaboral = true;
      if (['empleado','independiente'].includes(form.estadoLaboral)) {
        if (!form.ocupacion) newErrors.ocupacion = true;
        if (!form.empresa) newErrors.empresa = true;
        if (!form.antiguedad) newErrors.antiguedad = true;
      }
    }
    if (s === 3) {
      if (!form.ingresos) newErrors.ingresos = true;
      if (form.tieneDeudas === 'si' && !form.montoDeuda) newErrors.montoDeuda = true;
      if (form.tieneDeudas === 'si' && !form.cuotaDeuda) newErrors.cuotaDeuda = true;
    }
    if (s === 4) {
      if (!form.docDpi) newErrors.docDpi = true;
      if (!form.docIngresos) newErrors.docIngresos = true;
    }
    if (s === 5) {
      if (!form.aceptaTerminos) newErrors.aceptaTerminos = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const submit = async () => {
    if (!validateStep(step)) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('vehiculoNuevo', form.vehiculoNuevo);
    formData.append('tipoVehiculo', form.tipoVehiculo);
    formData.append('marcaModeloAnio', form.marcaModeloAnio);
    formData.append('precio', form.precio);
    formData.append('enganche', form.enganche);
    formData.append('plazo', form.plazo);
    formData.append('nombre', form.nombre);
    formData.append('dpi', form.dpi);
    formData.append('nit', form.nit);
    formData.append('fechaNacimiento', form.fechaNacimiento);
    formData.append('telefono', form.telefono);
    formData.append('correo', form.correo);
    formData.append('departamento', form.departamento);
    formData.append('municipio', form.municipio);
    formData.append('direccion', form.direccion);
    formData.append('estadoLaboral', form.estadoLaboral);
    formData.append('ocupacion', form.ocupacion);
    formData.append('empresa', form.empresa);
    formData.append('antiguedadLaboral', form.antiguedad);
    formData.append('ingresos', form.ingresos);
    formData.append('tieneDeudas', form.tieneDeudas);
    if (form.tieneDeudas === 'si') {
      formData.append('montoDeuda', form.montoDeuda);
      formData.append('cuotaDeuda', form.cuotaDeuda);
    }
    formData.append('aceptaTerminos', String(form.aceptaTerminos));
    form.docDpi && formData.append('docDpi', form.docDpi);
    form.docIngresos && formData.append('docIngresos', form.docIngresos);
    form.docRecibo && formData.append('docRecibo', form.docRecibo);
    try {
      const res = await fetch('/api/solicitudes', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Error al enviar solicitud');
      const { id } = await res.json();
      router.push(`/panel?id=${id}`);
    } catch (err) {
      console.error(err);
      alert('Falló el envío de la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Paso 1: Datos del vehículo ---
  function PasoVehiculo() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-[#0B1F3B]">
          Datos del vehículo
        </h2>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Estado del vehículo</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => update("vehiculoNuevo", "nuevo")} className={`flex-1 p-4 border border-gray-300 rounded-lg text-center ${form.vehiculoNuevo==="nuevo"?"bg-[#26B073] text-white":"bg-white text-[#0B1F3B]"}`}>Nuevo</button>
            <button type="button" onClick={() => update("vehiculoNuevo", "usado")} className={`flex-1 p-4 border border-gray-300 rounded-lg text-center ${form.vehiculoNuevo==="usado"?"bg-[#26B073] text-white":"bg-white text-[#0B1F3B]"}`}>Usado</button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Tipo de vehículo</label>
          <select
            value={form.tipoVehiculo}
            onChange={handleChange("tipoVehiculo")}
            className={getClass("tipoVehiculo")}
          >
            <option value="" disabled>Ej: Sedan</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Pickup">Pickup</option>
            <option value="Moto">Moto</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Marca, modelo y año</label>
          <input
            type="text"
            value={form.marcaModeloAnio}
            onChange={handleChange("marcaModeloAnio")}
            placeholder="Ej: Toyota Corolla 2022"
            className={getClass("marcaModeloAnio")}
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Precio estimado (Q)</label>
          <input
            type="text"
            value={formatMoney(form.precio)}
            onChange={handleMoneyChange("precio")}
            placeholder="Q 150,000"
            className={getClass("precio")}
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Enganche estimado (Q)</label>
          <input
            type="text"
            value={formatMoney(form.enganche)}
            onChange={handleMoneyChange("enganche")}
            placeholder="Q 30,000"
            className={getClass("enganche")}
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Plazo (meses)</label>
          <div className={`flex flex-wrap gap-2 ${errors.plazo ? 'ring-1 ring-red-500 rounded' : ''}`}>
            {[12, 24, 36, 48, 60, 72, 84, 96].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update("plazo", m.toString())}
                className={`px-4 py-2 rounded border ${
                  form.plazo === m.toString()
                    ? 'bg-[#26B073] text-white border-[#26B073]'
                    : 'bg-white text-[#0B1F3B] border-[#0B1F3B]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Paso 2: Datos personales y dirección ---
  function PasoPersonales() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-[#0B1F3B]">
          Datos personales
        </h2>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Nombre completo</label>
          <input
            type="text"
            value={form.nombre}
            onChange={handleChange("nombre")}
            placeholder="Ej: Juan Pérez"
            className={getClass("nombre")}
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">DPI</label>
          <input
            type="text"
            value={form.dpi}
            onChange={handleChange("dpi")}
            placeholder="1234567890101"
            className={getClass("dpi")}
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">NIT</label>
          <input
            type="text"
            value={form.nit}
            onChange={handleChange("nit")}
            placeholder="0001234-5"
            className={getClass("nit")}
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Fecha de nacimiento</label>
          <input
            type="date"
            value={form.fechaNacimiento}
            onChange={handleChange("fechaNacimiento")}
            className={getClass("fechaNacimiento")}
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Teléfono</label>
          <input
            type="tel"
            value={form.telefono}
            onChange={handleChange("telefono")}
            placeholder="3502-1234"
            className={getClass("telefono")}
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Correo electrónico</label>
          <input
            type="email"
            value={form.correo}
            onChange={handleChange("correo")}
            placeholder="correo@ejemplo.com"
            className={getClass("correo")}
          />
        </div>
        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <label className="block text-base font-medium text-[#0B1F3B] mb-1">Departamento</label>
            <select
              value={form.departamento}
              onChange={e => { update("departamento", e.target.value); update("municipio", ""); }}
              className={getClass("departamento")}
            >
              <option value="" disabled>Selecciona tu departamento</option>
              {Object.keys(DEPARTAMENTOS).map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-base font-medium text-[#0B1F3B] mb-1">Municipio</label>
            <select
              value={form.municipio}
              onChange={handleChange("municipio")}
              disabled={!form.departamento}
              className={`${getClass("municipio")} disabled:opacity-50`}
            >
              <option value="" disabled>Selecciona tu municipio</option>
              {(DEPARTAMENTOS[form.departamento] || []).map(mun => (
                <option key={mun} value={mun}>{mun}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Dirección exacta</label>
          <input
            type="text"
            value={form.direccion}
            onChange={handleChange("direccion")}
            placeholder="Tu dirección completa"
            className={getClass("direccion")}
          />
        </div>
      </div>
    );
  }

  // --- Paso 3: Laboral ---
  function PasoLaboral() {
    return (
      <div className="space-y-5">
        <h2 className="text-2xl font-extrabold text-[#0B1F3B]">
          Datos laborales
        </h2>
        <select
          value={form.estadoLaboral}
          onChange={handleChange("estadoLaboral")}
          className={getClass("estadoLaboral")}
        >
          <option value="">Estado laboral</option>
          <option value="desempleado">Desempleado</option>
          <option value="empleado">Empleado formal</option>
          <option value="independiente">Independiente</option>
        </select>
        {(form.estadoLaboral==="empleado" || form.estadoLaboral==="independiente") && (
          <>
            <input
              type="text"
              value={form.ocupacion}
              onChange={handleChange("ocupacion")}
              placeholder="Ocupación"
              className={getClass("ocupacion")}
            />
            <input
              type="text"
              value={form.empresa}
              onChange={handleChange("empresa")}
              placeholder="Empresa"
              className={getClass("empresa")}
            />
            <input
              type="text"
              value={form.antiguedad}
              onChange={handleChange("antiguedad")}
              placeholder="Antigüedad laboral (meses)"
              className={getClass("antiguedad")}
            />
          </>
        )}
      </div>
    );
  }

  // --- Paso 4: Ingresos y deudas ---
  function PasoIngresos() {
    return (
      <div className="space-y-5">
        <h2 className="text-2xl font-extrabold text-[#0B1F3B]">
          Ingresos y deudas
        </h2>
        <div className="mb-4">
          <label className="block text-base font-medium text-[#0B1F3B] mb-1">Ingresos (Q)</label>
          <input
            type="text"
            value={formatMoney(form.ingresos)}
            onChange={handleMoneyChange("ingresos")}
            placeholder="Ej: Q 4,000"
            className={getClass("ingresos")}
          />
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-[#0B1F3B] font-medium">¿Tenés otras deudas?</span>
          <button
            type="button"
            onClick={() => update("tieneDeudas", "si")}
            className={`px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#26B073] font-medium ${form.tieneDeudas==="si"? 'bg-[#26B073] text-white border-[#26B073]' : 'bg-white text-[#0B1F3B] border-[#0B1F3B]'}`}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => update("tieneDeudas", "no")}
            className={`px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#26B073] font-medium ${form.tieneDeudas==="no"? 'bg-[#26B073] text-white border-[#26B073]' : 'bg-white text-[#0B1F3B] border-[#0B1F3B]'}`}
          >
            No
          </button>
        </div>
        {form.tieneDeudas==="si" && (
          <>
            <input
              type="text"
              value={formatMoney(form.montoDeuda)}
              onChange={handleMoneyChange("montoDeuda")}
              placeholder="Monto total de otras deudas (Q)"
              className={getClass("montoDeuda")}
            />
            <input
              type="text"
              value={formatMoney(form.cuotaDeuda)}
              onChange={handleMoneyChange("cuotaDeuda")}
              placeholder="Cuota mensual de otras deudas (Q)"
              className={getClass("cuotaDeuda")}
            />
          </>
        )}
      </div>
    );
  }

  // --- Paso 5: Documentos ---
  function PasoDocumentos() {
    const dpiRef = createRef<HTMLInputElement>();
    const ingresosRef = createRef<HTMLInputElement>();
    const reciboRef = createRef<HTMLInputElement>();
    const docs = [
      { ref: dpiRef, key: 'docDpi', label: 'DPI obligatorio' },
      { ref: ingresosRef, key: 'docIngresos', label: 'Comprobante de ingresos obligatorio' },
      { ref: reciboRef, key: 'docRecibo', label: 'Recibo de servicio (opcional)' }
    ];
    return (
      <div className="space-y-5">
        <h2 className="text-2xl font-extrabold text-[#0B1F3B]">Carga de documentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {docs.map(({ ref, key, label }) => {
            const formKey = key as keyof FormState;
            const hasError = Boolean(errors[formKey]);
            const file = form[formKey] as File | null;
            return (
              <div
                key={key}
                onClick={() => ref.current?.click()}
                className={`flex flex-col items-center justify-center p-6 rounded-lg cursor-pointer border-2 ${hasError ? 'border-red-500' : 'border-dashed border-gray-300'} hover:bg-gray-50`}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  ref={ref}
                  className="hidden"
                  onChange={e => update(formKey, e.target.files?.[0] || null)}
                />
                {file ? (
                  <p className="font-medium">{file.name}</p>
                ) : (
                  <p className="text-gray-500">{label}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Paso 6: Términos ---
  function PasoTerminos() {
    return (
      <div className="space-y-5">
        <h2 className="text-2xl font-extrabold text-[#0B1F3B]">
          Términos y condiciones
        </h2>
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={form.aceptaTerminos}
            onChange={e => update("aceptaTerminos", e.target.checked)}
            className={`${errors.aceptaTerminos ? 'ring-2 ring-red-500' : ''} accent-[#26B073] h-5 w-5 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#26B073]`}
          />
          <span className="text-[#0B1F3B] font-medium">Acepto los <a href="#" className="underline text-[#26B073]">términos y condiciones</a> y el <a href="#" className="underline text-[#26B073]">aviso de privacidad</a></span>
        </label>
      </div>
    );
  }

  // --- Paso 7: Resumen ---
  function PasoResumen() {
    // Monto a financiar: precio - enganche
    const montoFinanciar = form.precio && form.enganche
      ? (Number(form.precio) - Number(form.enganche)).toString()
      : "";
    const sections = [
      {
        title: 'Datos del vehículo',
        items: [
          ['Estado', form.vehiculoNuevo],
          ['Tipo', form.tipoVehiculo],
          ['Modelo', form.marcaModeloAnio],
          ['Precio', formatMoney(form.precio)],
          ['Enganche', formatMoney(form.enganche)],
          ['Monto a financiar', formatMoney(montoFinanciar)],
          ['Plazo', `${form.plazo} meses`]
        ]
      },
      {
        title: 'Datos personales',
        items: [
          ['Nombre', form.nombre],
          ['DPI', form.dpi],
          ['NIT', form.nit],
          ['Nacimiento', form.fechaNacimiento],
          ['Teléfono', form.telefono],
          ['Correo', form.correo],
          ['Dirección', `${form.departamento}, ${form.municipio}, ${form.direccion}`]
        ]
      },
      {
        title: 'Documentos subidos',
        items: [
          ['DPI', form.docDpi ? (form.docDpi as File).name : 'No subido'],
          ['Ingresos', form.docIngresos ? (form.docIngresos as File).name : 'No subido'],
          ['Recibo', form.docRecibo ? (form.docRecibo as File).name : 'No subido']
        ]
      }
    ];
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-extrabold text-[#0B1F3B]">Resumen de tu solicitud</h2>
        {sections.map(({ title, items }) => (
          <section key={title} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {items.map(([label, value]) => (
                <React.Fragment key={label}>
                  <dt className="font-medium">{label}</dt>
                  <dd>{value}</dd>
                </React.Fragment>
              ))}
            </dl>
          </section>
        ))}
      </div>
    );
  }

  // --- Render principal ---
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4">
      {/* Logo y Título */}
      <div className="w-full max-w-xs flex items-center justify-center mb-4">
        <img src="/logo_transparente.PNG" alt="Fingro logo" className="h-12 w-auto object-contain" style={{maxHeight:48}} />
      </div>
      <h1 className="text-2xl font-bold text-[#0B1F3B] mb-4">Solicita tu crédito fácil</h1>
      {/* Progreso */}
      <div className="flex items-center justify-center mb-6 w-full max-w-xs">
        {steps.map((_, i) => (
          <React.Fragment key={i}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i <= step ? 'bg-[#26B073] text-white' : 'bg-gray-200 text-gray-400'}`}>
              {i + 1}
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-300 mx-1"></div>}
          </React.Fragment>
        ))}
      </div>
      {/* Card de formulario */}
      <section className="w-full max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-lg shadow-md p-6">
        {step === 0 && PasoVehiculo()}
        {step === 1 && PasoPersonales()}
        {step === 2 && PasoLaboral()}
        {step === 3 && PasoIngresos()}
        {step === 4 && PasoDocumentos()}
        {step === 5 && PasoTerminos()}
        {step === 6 && PasoResumen()}
        <div className="flex justify-between mt-6">
          <button onClick={prev} disabled={step === 0} className="text-[#0B1F3B] font-medium">
            Atrás
          </button>
          {step < steps.length - 1 ? (
            <button onClick={next} className="bg-[#26B073] text-white font-medium px-5 py-2 rounded-lg">
              Siguiente
            </button>
          ) : (
            <button onClick={submit} disabled={isSubmitting} className="bg-[#26B073] text-white font-medium px-5 py-2 rounded-lg">
              {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
