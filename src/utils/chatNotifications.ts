/**
 * Canlı destek operatör bildirimleri.
 *
 * Operatör başka sekmedeyken yeni sohbeti kaçırmasın diye iki kanal var:
 * kısa bir uyarı sesi ve (izin verilmişse) masaüstü bildirimi.
 *
 * Ses dosyası eklemek yerine WebAudio ile üretiliyor — ek istek yok,
 * derlemeye dosya girmiyor, tarayıcı önbelleğine bağımlı değil.
 */

// v2: masaüstü bildirimi varsayılan açık hale geldi; eski kayıtlarda
// çoğunlukla "kapalı" saklı olduğu için anahtar yenilendi.
const PREF_KEY = 'ahg_chat_notify_v2';

export interface NotificationPrefs {
  sound: boolean;
  desktop: boolean;
}

export const DEFAULT_PREFS: NotificationPrefs = { sound: true, desktop: true };

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

function getAudioContext(): AudioContext | null {
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

/**
 * Tarayıcılar ses çalmaya ve bildirim izni istemeye ancak bir kullanıcı
 * etkileşiminden sonra izin verir. Operatör panelde ilk kez tıkladığında
 * ses motoru açılır ve (henüz sorulmadıysa) bildirim izni istenir; böylece
 * sonradan başka sekmedeyken gelen mesajlarda ses de kart da çalışır.
 */
export function primeChatAlerts(wantDesktop: boolean): () => void {
  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } catch {
      /* yoksay */
    }
    if (wantDesktop && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {/* yoksay */});
    }
    remove();
  };
  const remove = () => {
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  return remove;
}

/**
 * İki notalı kısa bir uyarı sesi.
 *
 * Not: Tarayıcılar kullanıcı etkileşimi olmadan ses çalmayı engeller.
 * Operatör panelde bir yere tıkladıktan sonra çalışır; ilk açılışta
 * sessiz kalması normaldir.
 */
export function playChatAlert(): void {
  try {
    if (!getAudioContext() || !audioCtx) return;
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
 * Masaüstü bildirim kartı gösterir. Operatör panele bakıyorsa (sekme görünür
 * ve pencere odakta) gösterilmez; başka sekmede ya da başka uygulamadaysa
 * gösterilir. Kart, operatör tıklayana kadar ekranda kalır.
 */
export function notifyNewChat(
  title: string,
  body: string,
  onClick?: () => void,
): void {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible' && document.hasFocus()) return;

  try {
    const notification = new Notification(title, {
      body,
      // Aynı etiketle gönderilenler üst üste yığılmaz; renotify ile her yeni
      // mesajda kart yeniden uyarır
      tag: 'ahg-live-chat',
      renotify: true,
      requireInteraction: true,
      icon: '/favicon.ico',
    } as NotificationOptions);

    notification.onclick = () => {
      window.focus();
      onClick?.();
      notification.close();
    };
  } catch {
    /* bildirim gösterilemezse sessizce geç */
  }
}
