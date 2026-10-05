import { supabase } from '../lib/supabase';

export interface FloorPlanPdfFloor {
  title: string;
  units: string[];
}

export interface FloorPlanPdfOptions {
  hospitalName: string;
  /** Şube logosu; boşsa site (grup) logosu kullanılır */
  logoUrl?: string;
  address?: string;
  phone?: string;
  floors: FloorPlanPdfFloor[];
  labels: {
    heading: string;
    subheading: string;
    date: string;
  };
  fileName: string;
}

const PRIMARY = '#0F1F3A';
const ACCENT = '#E30613';
// A4 oranında (210x297) sabit genişlikli çizim alanı; html2canvas ile 2x ölçekte görüntülenir
const PAGE_WIDTH_PX = 794;
const PAGE_HEIGHT_PX = 1123;

const fetchSiteLogo = async (): Promise<string> => {
  try {
    const { data } = await supabase.from('site_settings').select('logo_url').limit(1).maybeSingle();
    return data?.logo_url || '';
  } catch {
    return '';
  }
};

// Görseli data URL'e çevirir; böylece canvas "tainted" olmaz. Başarısızsa boş döner.
const toDataUrl = async (url: string): Promise<string> => {
  if (!url || url.startsWith('data:')) return url;
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) return '';
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
};

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  style: Partial<CSSStyleDeclaration>,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  Object.assign(node.style, style);
  if (text !== undefined) node.textContent = text;
  return node;
};

const buildPage = (opts: FloorPlanPdfOptions, logo: string): HTMLDivElement => {
  const page = el('div', {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: `${PAGE_WIDTH_PX}px`,
    minHeight: `${PAGE_HEIGHT_PX}px`,
    padding: '36px 40px 28px',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: PRIMARY,
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  });

  // Üst bilgi: logo + hastane adı
  const header = el('div', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    paddingBottom: '16px',
    borderBottom: `3px solid ${ACCENT}`,
  });
  if (logo) {
    const img = el('img', { height: '56px', maxWidth: '260px', objectFit: 'contain' });
    img.src = logo;
    img.alt = '';
    header.appendChild(img);
  }
  const titleBox = el('div', { textAlign: logo ? 'right' : 'left', flex: '1' });
  titleBox.appendChild(el('div', { fontSize: '22px', fontWeight: '800', lineHeight: '1.2' }, opts.hospitalName));
  titleBox.appendChild(
    el('div', { fontSize: '13px', fontWeight: '700', color: ACCENT, marginTop: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }, opts.labels.heading),
  );
  titleBox.appendChild(el('div', { fontSize: '12px', color: '#475569', marginTop: '2px' }, opts.labels.subheading));
  header.appendChild(titleBox);
  page.appendChild(header);

  // Kat kartları (3 sütun)
  const grid = el('div', {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginTop: '18px',
    alignItems: 'start',
    alignContent: 'start',
  });
  for (const floor of opts.floors) {
    const card = el('div', {
      background: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: '10px',
      padding: '10px 12px',
      breakInside: 'avoid',
    });
    card.appendChild(
      el('div', { fontSize: '15px', fontWeight: '800', paddingBottom: '5px', marginBottom: '6px', borderBottom: `2px solid ${ACCENT}`, display: 'inline-block' }, floor.title),
    );
    const list = el('ul', { listStyle: 'none', margin: '0', padding: '0' });
    for (const unit of floor.units) {
      const li = el('li', { display: 'flex', gap: '6px', fontSize: '11px', lineHeight: '1.35', color: '#334155', marginTop: '3px' });
      // html2canvas küçük daire öğelerini kaydırabildiği için metin madde işareti kullanılıyor
      li.appendChild(el('span', { color: ACCENT, fontWeight: '700', flexShrink: '0' }, '•'));
      li.appendChild(el('span', {}, unit));
      list.appendChild(li);
    }
    card.appendChild(list);
    grid.appendChild(card);
  }
  page.appendChild(grid);
  page.appendChild(el('div', { height: '18px', flexShrink: '0' }));

  // Alt bilgi
  const footer = el('div', {
    marginTop: 'auto',
    paddingTop: '10px',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    fontSize: '10px',
    color: '#64748B',
  });
  footer.appendChild(el('div', {}, [opts.address, opts.phone].filter(Boolean).join('  ·  ')));
  footer.appendChild(el('div', { whiteSpace: 'nowrap' }, `www.anadoluhastaneleri.com  ·  ${opts.labels.date}`));
  page.appendChild(footer);

  return page;
};

/** Seçili şubenin kat planını tek sayfalık A4 PDF olarak indirir. */
export const downloadFloorPlanPdf = async (opts: FloorPlanPdfOptions): Promise<void> => {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);

  const logo = (await toDataUrl(opts.logoUrl || '')) || (await toDataUrl(await fetchSiteLogo()));
  const page = buildPage(opts, logo);
  document.body.appendChild(page);

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const img = page.querySelector('img');
    if (img && !img.complete) {
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }

    const canvas = await html2canvas(page, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // İçerik uzunsa sayfaya sığacak şekilde küçült → her zaman tek sayfa
    const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', (pageW - w) / 2, 0, w, h);
    pdf.setProperties({ title: `${opts.hospitalName} - ${opts.labels.heading}` });
    pdf.save(opts.fileName);
  } finally {
    page.remove();
  }
};
