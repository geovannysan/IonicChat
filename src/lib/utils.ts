import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función exacta de dashboard-chat para formatear fechas de WhatsApp
export function formatWhatsAppDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    // Hoy - mostrar solo la hora
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } else if (diffInDays === 1) {
    // Ayer
    return 'Ayer';
  } else if (diffInDays < 7) {
    // Esta semana - mostrar día de la semana
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  } else {
    // Más de una semana - mostrar fecha
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    });
  }
}

export function detectMimeFromBase64(base64OrDataUrl: string): string | null {
  // Si viene como dataURL → "data:image/png;base64,xxxx"
  const match = base64OrDataUrl.match(/^data:(.*?);base64,/);
  if (match) return match[1]; // MIME directo

  // Si es solo base64 → analizar primeros bytes
  const base64 = base64OrDataUrl.substring(0, 50);
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";       // PNG
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return "image/jpeg";      // JPG
  if (bytes[0] === 0x47 && bytes[1] === 0x49) return "image/gif";       // GIF
  if (bytes[0] === 0x25 && bytes[1] === 0x50) return "application/pdf"; // PDF
  if (bytes[0] === 0x50 && bytes[1] === 0x4B) return "application/zip"; // ZIP, DOCX, XLSX

  return null;
}
export function base64ToFileAuto(base64OrDataUrl: string): File {
  const mime = detectMimeFromBase64(base64OrDataUrl) || "application/octet-stream";

  // Extraer solo el base64 puro
  const base64 = base64OrDataUrl.includes("base64,")
    ? base64OrDataUrl.split("base64,")[1]
    : base64OrDataUrl;

  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const ext = mime.split("/")[1] || "bin";
  const filename = `archivo.${ext}`;

  return new File([bytes], filename, { type: mime });
}


export function parseGoogleMapsLocation(body: string): {
  latitude: number;
  longitude: number;
  label: string;
  base: string;
} | null {
  try {
    const parts = body.split("|");

    if (parts.length < 2) return null;

    const url = decodeURIComponent(parts[1].trim());
    const match = url.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);

    if (!match) return null;

    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);
    const base = parts[0]
    // Usa el tercer pipe o las siguientes líneas como label
    const label = parts[2]?.trim() || body.split("\n").slice(1).join(", ");
    
    return {
      base,
      latitude,
      longitude,
      label,
    };
  } catch {
    console.error("Error al parsear ubicación de Google Maps:", body);
    return null;
  }
}

export function parseAdvancedVCard(body: string): {
  name?: string;
  phones: { number: string; label?: string }[];
} {
  const nameMatch = body.match(/FN:(.+)/);
  const name = nameMatch?.[1]?.trim();

  const phones: { number: string; label?: string }[] = [];

  const lines = body.split("\n").map((line) => line.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const telMatch = line.match(/item\d+\.TEL.*:(.+)/);
    if (telMatch) {
      const number = telMatch[1].trim();

      const labelLine = lines[i + 1];
      const labelMatch = labelLine?.match(/X-ABLabel:(.+)/i);
      const label = labelMatch ? labelMatch[1].trim() : undefined;

      phones.push({ number, label });
    }
  }

  return { name, phones };
}