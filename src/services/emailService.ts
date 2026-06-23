import { supabase } from '../lib/supabase';

export type FormType = 'second_opinion' | 'contact' | 'feedback';

/**
 * Form başvurusunu admin panelinde belirlenen alıcı e-posta adresine gönderir.
 * Alıcı adresi güvenlik gereği Edge Function içinde site_settings'ten okunur;
 * burada sadece form tipi ve veriler iletilir.
 *
 * Not: Başvuru zaten veritabanına kaydedilmiş olur. E-posta gönderimi başarısız
 * olursa kullanıcı akışı bozulmaz — hata sadece konsola yazılır ve `false` döner.
 */
export async function sendFormEmail(
  formType: FormType,
  data: Record<string, unknown>,
): Promise<boolean> {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-form-email', {
      body: { formType, data },
    });

    if (error) {
      console.error('Form e-postası gönderilemedi:', error);
      return false;
    }
    return Boolean((result as { success?: boolean } | null)?.success);
  } catch (err) {
    console.error('Form e-postası gönderilirken beklenmeyen hata:', err);
    return false;
  }
}
