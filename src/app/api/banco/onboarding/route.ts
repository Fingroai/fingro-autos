import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const {
      nombre,
      id_fiscal,
      correo,
      password,
      logo_url,
      client_account,
      invited_analysts,
      filtros,
    } = await request.json()

    // Crear usuario de banco en Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: correo,
      password,
      email_confirm: true,
    })
    if (authError) throw authError
    const banco_id = user.id

    // Insert en tabla bancos
    const { error: bancoError } = await supabaseAdmin
      .from('bancos')
      .insert([{
        id: banco_id,
        nombre,
        id_fiscal,
        correo_contacto: correo,
        logo_url,
        client_account,
        invited_analysts
      }])
    if (bancoError) throw bancoError

    // Insert en filtros_bancarios
    const { error: filtrosError } = await supabaseAdmin
      .from('filtros_bancarios')
      .insert([{ banco_id, tipo_carro: filtros.tipo_carro, monto_minimo: filtros.monto_minimo, monto_maximo: filtros.monto_maximo, plazo_minimo: filtros.plazo_minimo, plazo_maximo: filtros.plazo_maximo }])
    if (filtrosError) throw filtrosError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API /banco/onboarding error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
