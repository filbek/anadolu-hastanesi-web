import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface HospitalMapProps {
  latitude: string | number
  longitude: string | number
  name: string
  address?: string
  className?: string
  zoom?: number
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Hastane ikonlu özel pin. Google embed iframe'i pin özelleştirmeye izin
// vermediği için koordinatı bilinen hastanelerde Leaflet/OSM kullanılıyor.
const hospitalIcon = L.divIcon({
  className: 'hospital-map-marker',
  html: `
    <div class="hospital-map-pin">
      <div class="hospital-map-pin-head"><i class="bi bi-hospital-fill"></i></div>
      <div class="hospital-map-pin-tail"></div>
    </div>
  `,
  iconSize: [44, 56],
  iconAnchor: [22, 54],
  popupAnchor: [0, -50],
})

const HospitalMap = ({ latitude, longitude, name, address, className = '', zoom = 16 }: HospitalMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    const lat = Number(latitude)
    const lng = Number(longitude)
    if (!containerRef.current || mapRef.current || !isFinite(lat) || !isFinite(lng)) return

    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([lat, lng], zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    L.marker([lat, lng], { icon: hospitalIcon })
      .addTo(map)
      .bindPopup(
        `<strong>${escapeHtml(name)}</strong>` +
          (address ? `<br/><span>${escapeHtml(address)}</span>` : '') +
          `<br/><a href="${directionsUrl}" target="_blank" rel="noopener noreferrer">Yol Tarifi Al →</a>`
      )

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [latitude, longitude, name, address, zoom])

  return <div ref={containerRef} className={`hospital-map ${className}`} />
}

export default HospitalMap
