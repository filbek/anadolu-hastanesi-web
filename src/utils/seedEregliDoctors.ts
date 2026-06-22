import { supabase } from '../lib/supabase';
import { nameToSlug, SeedProgress } from './seedSilivriDoctors';

// Vite glob import for Ereğli doctor images
const imageModules = import.meta.glob('../assests/eregli/*', { eager: true, as: 'url' });

// Ereğli doctors parsed from filenames
export const EREGLI_DOCTORS_DATA = [
  { filename: 'Dr. Uğur KURT - acil servis.jpg', name: 'Dr. Uğur Kurt', title: 'Dr.', deptSlug: 'acil-servis' },
  { filename: 'Dr.Shadi Barani - acil servis.jpg', name: 'Dr. Shadi Barani', title: 'Dr.', deptSlug: 'acil-servis' },
  { filename: 'Dyt. Sena YALÇIN - beslenme ve diyet.jpg', name: 'Dyt. Sena Yalçın', title: 'Dyt.', deptSlug: 'beslenme-ve-diyet' },
  { filename: 'Op. Dr. Alev UYGUN - kadın hastalıkları ve doğum.jpg', name: 'Op. Dr. Alev Uygun', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Op. Dr. Derya KULAÇ KARADENİZ - göz sağlığı ve hastalıkları.jpg', name: 'Op. Dr. Derya Kulaç Karadeniz', title: 'Op. Dr.', deptSlug: 'goz-sagligi-ve-hastaliklari' },
  { filename: 'Op. Dr. Emin DAMGACI - kadın hastalıkları ve doğum.jpg', name: 'Op. Dr. Emin Damgacı', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Op. Dr. Osman GENÇOĞLU -üroloji.jpg', name: 'Op. Dr. Osman Gençoğlu', title: 'Op. Dr.', deptSlug: 'uroloji' },
  { filename: 'Op. Dr. Selami ALTUNTAŞ - beyin ve sinir cerrahi.png', name: 'Op. Dr. Selami Altuntaş', title: 'Op. Dr.', deptSlug: 'beyin-ve-sinir-cerrahisi' },
  { filename: 'Op.Dr ali Burak Doğan - ORTOPEDİ VE TRAVMATOLOJİ.jpg', name: 'Op. Dr. Ali Burak Doğan', title: 'Op. Dr.', deptSlug: 'ortopedi-ve-travmatoloji' },
  { filename: 'Op.Dr. Evrim Balbaloğlu - kulak burun boğaz.jpg', name: 'Op. Dr. Evrim Balbaloğlu', title: 'Op. Dr.', deptSlug: 'kulak-burun-bogaz' },
  { filename: 'Uzm. Dr. Ceyhun MEMMEDOV - kardiyoloji.jpg', name: 'Uzm. Dr. Ceyhun Memmedov', title: 'Uzm. Dr.', deptSlug: 'kardiyoloji' },
  { filename: 'Uzm. Dr. Erhan OĞUR - göğüs hastalıkları.jpg', name: 'Uzm. Dr. Erhan Oğur', title: 'Uzm. Dr.', deptSlug: 'gogus-hastaliklari' },
  { filename: 'Uzm. Dr. Gökçe Akman KÖSE - anestezi ve reanimasyon.jpg', name: 'Uzm. Dr. Gökçe Akman Köse', title: 'Uzm. Dr.', deptSlug: 'anestezi-ve-reanimasyon' },
  { filename: 'Uzm. Dr. Hasan MERAL - nöroloji.jpg', name: 'Uzm. Dr. Hasan Meral', title: 'Uzm. Dr.', deptSlug: 'noroloji' },
  { filename: 'Uzm. Dr. Hasan YILMAZ - çocuk sağlığı ve hastalıkları.jpg', name: 'Uzm. Dr. Hasan Yılmaz', title: 'Uzm. Dr.', deptSlug: 'cocuk-sagligi-ve-hastaliklari' },
  { filename: 'Uzm. Dr. Hülya ATİK MOLON - fizik tedavi ve rehabilitasyon.jpg', name: 'Uzm. Dr. Hülya Atik Molon', title: 'Uzm. Dr.', deptSlug: 'fizik-tedavi-ve-rehabilitasyon' },
  { filename: 'Uzm. Dr. Lütfi MOLON - çocuk sağlığı ve hastalıkları.jpg', name: 'Uzm. Dr. Lütfi Molon', title: 'Uzm. Dr.', deptSlug: 'cocuk-sagligi-ve-hastaliklari' },
  { filename: 'Uzm. Dr. Nigar RUSTAMOVA - medical onkoloji.jpg', name: 'Uzm. Dr. Nigar Rustamova', title: 'Uzm. Dr.', deptSlug: 'medikal-onkoloji' },
  { filename: 'Uzm. Dr. Ramazan ATAGÜN - iç hastalıkları ( Dahiliye ).jpg', name: 'Uzm. Dr. Ramazan Atagün', title: 'Uzm. Dr.', deptSlug: 'ic-hastaliklari-dahiliye' },
  { filename: 'Uzm. Dr. Sadi YETKİLİ - iç hastalıkları ( dahiliye ).jpg', name: 'Uzm. Dr. Sadi Yetkili', title: 'Uzm. Dr.', deptSlug: 'ic-hastaliklari-dahiliye' },
  { filename: 'Uzm. Dr. Serdal DALKÜN - biyokimya.jpg', name: 'Uzm. Dr. Serdal Dalkün', title: 'Uzm. Dr.', deptSlug: 'biyokimya' },
  { filename: 'Uzm. Dr. Veyis TURAN - anestezi ve reanimasyon.jpg', name: 'Uzm. Dr. Veyis Turan', title: 'Uzm. Dr.', deptSlug: 'anestezi-ve-reanimasyon' },
  { filename: 'Uzm. Dr. Yaşar BAYKAL - iç hastalıkları ( Dahiliye ).jpg', name: 'Uzm. Dr. Yaşar Baykal', title: 'Uzm. Dr.', deptSlug: 'ic-hastaliklari-dahiliye' },
  { filename: 'Uzm. Dr. Ülkü TURPCU ERİTMEN - radyoloji.jpg', name: 'Uzm. Dr. Ülkü Turpcu Eriğmen', title: 'Uzm. Dr.', deptSlug: 'radyoloji' },
  { filename: 'Uzm. Klinik Psikolog Büşra Yılmaz - psikoloji.jpg', name: 'Uzm. Klinik Psikolog Büşra Yılmaz', title: 'Uzm. Psikolog', deptSlug: 'psikoloji' },
  { filename: 'dr aynur karakaya - acil servis.jpg', name: 'Dr. Aynur Karakaya', title: 'Dr.', deptSlug: 'acil-servis' },
  { filename: 'dr muhammed erturk - acil servis.jpg', name: 'Dr. Muhammed Erturk', title: 'Dr.', deptSlug: 'acil-servis' },
  { filename: 'dr muzaffer güngör - acil servis.jpg', name: 'Dr. Muzaffer Güngör', title: 'Dr.', deptSlug: 'acil-servis' },
  { filename: 'op.dr.olcay çınar - genel cerrahi.jpg', name: 'Op. Dr. Olcay Çınar', title: 'Op. Dr.', deptSlug: 'genel-cerrahi' },
  { filename: 'op.dr.selcan kesgin - KULAK BURUN BOĞAZ.jpg', name: 'Op. Dr. Selcan Kesgin', title: 'Op. Dr.', deptSlug: 'kulak-burun-bogaz' },
  { filename: 'op.dr.volkan tutuş -  ORTOPEDİ VE TRAVMATOLOJİ.jpg', name: 'Op. Dr. Volkan Tutuş', title: 'Op. Dr.', deptSlug: 'ortopedi-ve-travmatoloji' },
  { filename: 'uzm.dr evlin görgülü - ENFEKSİYON HASTALIKLARI VE MİKROBİYOLOJİ.jpg', name: 'Uzm. Dr. Evlin Görgülü', title: 'Uzm. Dr.', deptSlug: 'enfeksiyon-hastaliklari-ve-mikrobiyoloji' },
  { filename: 'uzm.dr mutlu çayırlü - dermatoloji.jpg', name: 'Uzm. Dr. Mutlu Çayırlı', title: 'Uzm. Dr.', deptSlug: 'dermatoloji' },
];

export async function seedEregliDoctors(
  hospitalIdMap: Record<string, number>,
  deptIdMap: Record<string, number>,
  onProgress: (p: SeedProgress) => void
): Promise<void> {
  const eregliId = hospitalIdMap['ozel-eregli-anadolu-hastanesi'];
  if (!eregliId) {
    onProgress({ step: 'Ereğli Doktorları', status: 'error', detail: 'Ereğli hastane ID bulunamadı' });
    return;
  }

  onProgress({ step: 'Ereğli Doktorları', status: 'running', detail: 'Doktorlar yükleniyor...' });

  // Check if storage bucket exists, create if not
  await supabase.storage.createBucket('doctor-images', { public: true }).catch(() => {});

  let successCount = 0;
  let errorCount = 0;

  for (const doctor of EREGLI_DOCTORS_DATA) {
    const slug = nameToSlug(doctor.name);

    const deptId = deptIdMap[doctor.deptSlug];
    if (!deptId) {
      onProgress({ step: 'Ereğli Doktorları', status: 'running', detail: `Bölüm bulunamadı (${doctor.deptSlug}): ${doctor.name}` });
      errorCount++;
      continue;
    }

    // Find and upload image first
    const normalizedFilename = doctor.filename.toLowerCase().replace(/\s+/g, ' ').trim();
    const imageKey = Object.keys(imageModules).find(key => {
      const keyFilename = key.split('/').pop()?.toLowerCase().replace(/\s+/g, ' ').trim();
      return keyFilename === normalizedFilename;
    });
    let imageUrl = '';

    if (imageKey) {
      try {
        const localUrl = imageModules[imageKey] as string;
        const response = await fetch(localUrl);
        const blob = await response.blob();
        const ext = doctor.filename.split('.').pop() || 'jpg';
        const storagePath = `eregli/${slug}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('doctor-images')
          .upload(storagePath, blob, { contentType: blob.type, upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('doctor-images').getPublicUrl(storagePath);
          imageUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.error('Image upload failed for', doctor.name, ':', err);
      }
    } else {
      console.warn('Image not found for', doctor.name, '- filename:', doctor.filename);
    }

    // Check if doctor already exists
    const { data: existing } = await supabase.from('doctors').select('id, image').eq('slug', slug).maybeSingle();
    if (existing) {
      if (!existing.image && imageUrl) {
        await supabase.from('doctors').update({ image: imageUrl }).eq('id', existing.id);
        onProgress({ step: 'Ereğli Doktorları', status: 'running', detail: `Resim güncellendi: ${doctor.name}` });
      } else {
        onProgress({ step: 'Ereğli Doktorları', status: 'running', detail: `Mevcut, atlandı: ${doctor.name}` });
      }
      continue;
    }

    const { error } = await supabase.from('doctors').insert([{
      name: doctor.name,
      slug,
      title: doctor.title,
      department_id: deptId,
      hospital_id: eregliId,
      image: imageUrl,
      education: '',
      experience: '',
    }]);

    if (error) {
      onProgress({ step: 'Ereğli Doktorları', status: 'running', detail: `Hata: ${doctor.name} - ${error.message}` });
      errorCount++;
    } else {
      onProgress({ step: 'Ereğli Doktorları', status: 'running', detail: `Eklendi: ${doctor.name}` });
      successCount++;
    }
  }

  onProgress({
    step: 'Ereğli Doktorları',
    status: errorCount > 0 && successCount === 0 ? 'error' : 'done',
    detail: `${successCount} doktor eklendi, ${errorCount} hata`,
  });
}
