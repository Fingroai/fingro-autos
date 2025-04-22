# RFC: Founder Cockpit Dashboard (/control)

## 1. Contexto y Objetivos

**Contexto**: El Founder Cockpit es el panel administrativo para acceso de Admin/Founder. Debe reportar métricas clave, gráficos y logs de actividad para tomar decisiones estratégicas.

**Objetivos**:
- Centralizar KPIs de negocio: solicitudes, ofertas, aceptaciones y tiempos.
- Visualizar tendencias (semanales, por tipo de vehículo, canal de adquisición).
- Permitir auditoría de actividad (logs de usuarios y bancos).
- Facilitar generación de reportes internos.

## 2. Personas y Casos de Uso

- **Founder/Admin**: revisar desempeño global, identificar cuellos de botella, exportar reportes.
- **Product Owner**: validar adopción y uso de funcionalidades.

## 3. Alcance MVP

1. **Cards KPI**:
   - Total solicitudes recibidas
   - % solicitudes con ofertas
   - % ofertas aceptadas
   - Tiempo promedio de respuesta (envío→aceptación)
2. **Gráficos**:
   - Barras: solicitudes vs aceptadas por semana (últimas 12 semanas)
   - Pastel: distribución de solicitudes por tipo de vehículo (nuevo/usado)
3. **Tabla de Logs**:
   - Columnas: Fecha, Usuario/Banco, Acción, ID de entidad, Detalles
   - Filtros: fecha, rol (usuario/banco), tipo de acción
4. **Export CSV** de métricas y logs

## 4. Métricas & Definiciones

| Métrica              | Cálculo                                      |
|----------------------|----------------------------------------------|
| Solicitudes Recibidas| Conteo total de registros en tabla `solicitudes` |
| % con Ofertas        | (requests con al menos 1 oferta) / total      |
| % Aceptadas          | ofertas aceptadas / ofertas enviadas         |
| Tiempo Respuesta     | avg(timestamp aceptada - timestamp enviada)  |

### Métricas Avanzadas (Founder)
+ **Métricas Medibles (dashboard founder)**
+ 
+ **Demanda (Solicitudes)**
+ - `TotalSolicitudes`: total de registros en `solicitudes`.
+ - `DocumentosCompletos%`: % de solicitudes con los 3 documentos cargados.
+ - `AvgMontoSolicitado`: promedio de `monto_financiar`.
+ - `AvgPlazoSolicitado`: promedio de `plazo`.
+ 
+ **Oferta (Ofertas)**
+ - `TotalOfertas`: total de registros en `ofertas`.
+ - `SolicitudesConOferta%` (Fill Rate): solicitudes con ≥1 oferta / total solicitudes *100.
+ - `AvgOfertasPorSolicitud`: total ofertas / total solicitudes.
+ - `TimeToFirstOffer`: avg(primera oferta.created_at - solicitud.created_at).
+ 
+ **Conversión**
+ - `TotalAceptadas`: ofertas con `aceptada=true`.
+ - `OfferToAccept%`: total aceptadas / total ofertas *100.
+ - `TimeToAccept`: avg(oferta.updated_at - oferta.created_at) para aceptadas.
+ 
+ **Monetarios**
+ - `GMV`: sum(monto) de ofertas aceptadas.
+ - `AvgTicket`: GMV / total aceptadas.
+ - `AvgTasaInteres`: promedio de `tasa_interes` de aceptadas.
+ - `AvgPlazoAceptado`: promedio de `plazo` de aceptadas.
+ - `TakeRate%`: comisiones plataforma / GMV *100.
+ 
+ **Entidades Activas**
+ - `ActiveBancos`: bancos distintos que envían ofertas en el periodo.
+ - `ActiveSolicitantes`: solicitantes únicos con actividad.
+ 
+ *Cada métrica se obtiene vía `GET /api/admin/metrics`.*

## 5. Datos & Endpoints

- **Supabase**
  - Tablas: `solicitudes`, `ofertas`, `activity_logs`
  - Relación: `ofertas.solicitud_id` → `solicitudes.id`
- **API Endpoints** (Next.js App Router)
  - `GET /api/admin/metrics` → devuelve cifras KPI
  - `GET /api/admin/weekly-trends` → solicitudes vs aceptadas por semana
  - `GET /api/admin/distribution` → % por tipo de vehículo
  - `GET /api/admin/logs?start=&end=&actor=&action=` → paginado y filtrado

## 6. UI/UX

- **Layout Mobile‑first**: 1‑col en móvil, 4‑cols en desktop para KPI cards
- **Gráficos**: usar librería ligera (e.g. Chart.js o Recharts)
- **Tabla de Logs**: paginación, búsqueda rápida, filtros colapsables
- **Consistencia**: colores de branding (#26B073 primary, #0B1F3B dark)

## 7. Tecnología & Dependencias

- **Frontend**: Next.js App Router, Tailwind CSS
- **Charts**: Chart.js o Recharts
- **Backend**: Supabase Admin SDK

## 8. Timeline

| Tarea                         | Estimado |
|-------------------------------|----------|
| Endpoint de métricas          | 1 día    |
| Cards KPI & layout            | 0.5 día  |
| Weekly trends & API           | 1 día    |
| Pie distribution & API        | 0.5 día  |
| Tabla logs & filtros          | 1 día    |
| QA & ajuste responsivo        | 1 día    |

---
*Revisar con founder antes de implementación.*
