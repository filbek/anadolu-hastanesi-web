// Ziyaretçinin ülke kodunu döndürür (Vercel'in IP tabanlı x-vercel-ip-country başlığından).
// Site dilinin ülkeye göre otomatik seçilmesi için src/i18n.ts tarafından çağrılır.
export function GET(request) {
  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase()
  return Response.json(
    { country: /^[A-Z]{2}$/.test(country) ? country : null },
    { headers: { 'Cache-Control': 'private, no-store' } }
  )
}
