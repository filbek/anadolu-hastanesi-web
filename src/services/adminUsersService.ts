import { supabase } from '../lib/supabase';

/**
 * Kullanıcı yönetimi supabase.auth.admin.* uçlarını gerektirir; bu uçlar
 * yalnızca service_role anahtarıyla çalışır ve o anahtar tarayıcıya konulamaz.
 * Bu yüzden tüm işlemler admin-users edge function'ı üzerinden yapılır
 * (bkz. supabase/functions/admin-users/index.ts). Fonksiyon çağıranın
 * rolünü profiles tablosundan doğrular.
 *
 * Kullanıcılar sayfası (admin) ve Canlı Destek → Ekip (süpervizör, yalnızca
 * çağrı merkezi hesapları) aynı yardımcıyı kullanır.
 */
export const callAdminUsers = async <T,>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke('admin-users', { body });

  if (error) {
    // Edge function hata gövdesindeki mesajı okumaya çalış
    let message = error.message;
    const response = (error as any).context as Response | undefined;
    if (response) {
      try {
        const parsed = await response.clone().json();
        if (parsed?.error) message = parsed.error;
      } catch {
        // gövde JSON değilse varsayılan mesaj kalsın
      }
    }
    throw new Error(message);
  }

  if (data?.error) throw new Error(data.error);
  return data as T;
};
