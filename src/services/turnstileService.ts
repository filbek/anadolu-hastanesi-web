import { supabase } from '../lib/supabase';

/** Turnstile yalnızca site anahtarı tanımlıysa devrededir (dev ortamında opsiyonel). */
export const turnstileEnabled = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

/**
 * Turnstile token'ını sunucu (edge function) üzerinden doğrular.
 * Başarısızsa false döner; çağıran taraf gönderimi durdurmalıdır.
 */
export async function verifyTurnstile(token: string | null): Promise<boolean> {
  if (!turnstileEnabled) return true; // Anahtar yoksa koruma devre dışı — akış bozulmaz
  if (!token) return false;
  try {
    const { data, error } = await supabase.functions.invoke('verify-turnstile', {
      body: { token },
    });
    if (error) {
      console.error('Turnstile doğrulama hatası:', error);
      return false;
    }
    return Boolean((data as { success?: boolean } | null)?.success);
  } catch (err) {
    console.error('Turnstile doğrulaması sırasında beklenmeyen hata:', err);
    return false;
  }
}
