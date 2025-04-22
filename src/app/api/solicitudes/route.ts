import { NextRequest } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Ensure 'solicitudes' bucket exists: list and create if missing
    {
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
      if (listError) throw listError;
      const exists = buckets.some((b: any) => b.name === 'solicitudes');
      if (!exists) {
        const { error: createError } = await supabaseAdmin.storage.createBucket('solicitudes', { public: true });
        if (createError) throw createError;
      }
    }
    const formData = await request.formData();
    const id = uuidv4();

    // Extraer campos del formulario
    const vehiculoNuevo = formData.get('vehiculoNuevo') as string;
    const tipoVehiculo = formData.get('tipoVehiculo') as string;
    const marcaModeloAnio = formData.get('marcaModeloAnio') as string;
    const precio = parseFloat(formData.get('precio') as string);
    const enganche = parseFloat(formData.get('enganche') as string);
    const plazo = parseInt(formData.get('plazo') as string, 10);

    const nombre = formData.get('nombre') as string;
    const dpi = formData.get('dpi') as string;
    const nit = formData.get('nit') as string;
    const fechaNacimiento = formData.get('fechaNacimiento') as string;
    const telefono = formData.get('telefono') as string;
    const correo = formData.get('correo') as string;

    const departamento = formData.get('departamento') as string;
    const municipio = formData.get('municipio') as string;
    const direccion = formData.get('direccion') as string;

    const estadoLaboral = formData.get('estadoLaboral') as string;
    const ocupacion = formData.get('ocupacion') as string;
    const empresa = formData.get('empresa') as string;

    const ingresos = parseFloat(formData.get('ingresos') as string);
    const tieneDeudas = formData.get('tieneDeudas') === 'si';
    const montoDeuda = tieneDeudas ? parseFloat(formData.get('montoDeuda') as string) : null;
    const cuotaDeuda = tieneDeudas ? parseFloat(formData.get('cuotaDeuda') as string) : null;

    const aceptaTerminos = formData.get('aceptaTerminos') === 'true';

    // Calcular monto a financiar
    const montoFinanciar = precio - enganche;

    // Subir documentos a Storage
    const documentos: Record<string, string> = {};
    const uploadFields = ['docDpi', 'docIngresos', 'docRecibo'];
    for (const field of uploadFields) {
      const file = formData.get(field) as File;
      if (file && file.size > 0) {
        const ext = file.name.split('.').pop();
        const path = `solicitudes/${id}/${field}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from('solicitudes')
          .upload(path, file);
        if (uploadError) throw uploadError;
        const { data } = supabaseAdmin.storage
          .from('solicitudes')
          .getPublicUrl(path);
        const publicUrl = data.publicUrl;
        documentos[field] = publicUrl;
      }
    }

    // Insertar registro en la tabla solicitudes
    const { error: insertError } = await supabaseAdmin
      .from('solicitudes')
      .insert([
        {
          id,
          vehiculo_nuevo: vehiculoNuevo,
          tipo_vehiculo: tipoVehiculo,
          marca_modelo_anio: marcaModeloAnio,
          precio,
          enganche,
          plazo,
          nombre,
          dpi,
          nit,
          fecha_nacimiento: fechaNacimiento,
          telefono,
          correo,
          departamento,
          municipio,
          direccion,
          estado_laboral: estadoLaboral,
          ocupacion,
          empresa,
          ingresos,
          tiene_deudas: tieneDeudas,
          monto_deuda: montoDeuda,
          cuota_deuda: cuotaDeuda,
          acepta_terminos: aceptaTerminos,
          monto_financiar: montoFinanciar,
          documentos,
        },
      ]);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('API /solicitudes error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const correo = searchParams.get('correo');
    if (!id && !correo) {
      return new Response(JSON.stringify({ error: 'Missing id or correo' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const { data, error } = await supabaseAdmin
      .from('solicitudes')
      .select('*')
      .eq(id ? 'id' : 'correo', id ?? correo!)
      .maybeSingle();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('API /solicitudes GET error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
