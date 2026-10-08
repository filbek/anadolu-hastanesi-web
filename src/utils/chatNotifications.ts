/**
 * Canlı destek operatör bildirimleri.
 *
 * Operatör başka sekmedeyken yeni sohbeti kaçırmasın diye iki kanal var:
 * kısa bir uyarı sesi ve (izin verilmişse) masaüstü bildirimi.
 *
 * Ses dosyası eklemek yerine WebAudio ile üretiliyor — ek istek yok,
 * derlemeye dosya girmiyor, tarayıcı önbelleğine bağımlı değil.
 */

const PREF_KEY = 'ahg_chat_notify';

export interface NotificationPrefs {
  sound: boolean;
  desktop: boolean;
}

export const DEFAULT_PREFS: NotificationPrefs = { sound: true, desktop: false };

export function loadNotificationPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  } catch {
    /* yoksay */
  }
}

let audioCtx: AudioContext | null = null;

/**
 * İki notalı kısa bir uyarı sesi.
 *
 * Not: Tarayıcılar kullanıcı etkileşimi olmadan ses çalmayı engeller.
 * Operatör panelde bir yere tıkladıktan sonra çalışır; ilk açılışta
 * sessiz kalması normaldir.
 */
export function playChatAlert(): void {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    if (!audioCtx) audioCtx = new Ctor();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    // 880 Hz -> 1175 Hz, toplam ~0.28 sn
    [
      { freq: 880, at: 0 },
      { freq: 1175, at: 0.14 },
    ].forEach(({ freq, at }) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + at);

      // Tık sesi olmaması için hızlı açılıp yumuşak kapanan zarf
      gain.gain.setValueAtTime(0, now + at);
      gain.gain.linearRampToValueAtTime(0.14, now + at + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.13);

      osc.connect(gain).connect(audioCtx!.destination);
      osc.start(now + at);
      osc.stop(now + at + 0.14);
    });
  } catch {
    /* ses çalınamazsa rozet zaten uyarıyor */
  }
}

/** Masaüstü bildirimi izni ister. Kullanıcı tıklamasından çağrılmalıdır. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Masaüstü bildirimi gösterir. Sekmeye odaklanılmışsa gösterilmez —
 * operatör zaten ekrana bakıyordur.
 */
export function notifyNewChat(count: number): void {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') return;

  try {
    const notification = new Notification('Yeni canlı destek mesajı', {
      body:
        count > 1
          ? `${count} görüşme yanıt bekliyor.`
          : 'Bir görüşme yanıt bekliyor.',
      // Aynı etiketle gönderilen bildirimler üst üste yığılmaz
      tag: 'ahg-live-chat',
      icon: '/favicon.ico',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    /* bildirim gösterilemezse sessizce geç */
  }
}
