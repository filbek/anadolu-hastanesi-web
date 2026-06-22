import { supabase } from '../lib/supabase';
import { nameToSlug, SeedProgress } from './seedSilivriDoctors';

// Vite glob import for Avcılar doctor images
const imageModules = import.meta.glob('../assests/avcilar/*', { eager: true, as: 'url' });

// Avcılar doctors parsed from filenames
export const AVCILAR_DOCTORS_DATA = [
  { filename: 'Doç Dr. Ahmet TEMİZ - kardiyoloji.jpg', name: 'Doç Dr. Ahmet Temiz', title: 'Doç Dr.', deptSlug: 'kardiyoloji' },
  { filename: 'Doç. Dr. Figen KOÇYİĞİT - fizik tedavi ve rehabilitasyon.jpg', name: 'Doç. Dr. Figen Koçyiğit', title: 'Doç. Dr.', deptSlug: 'fizik-tedavi-ve-rehabilitasyon' },
  { filename: 'Dr. Ercan YAŞA - acil servis.jpg', name: 'Dr. Ercan Yaşa', title: 'Dr.', deptSlug: 'acil-servis' },
  { filename: 'Dr. Öğr. Üye. Mehmet KÖROĞLU - iç hastalıkları ( Dahiliye).jpg', name: 'Dr. Öğr. Üyesi Mehmet Köroğlu', title: 'Dr. Öğr. Üyesi', deptSlug: 'ic-hastaliklari-dahiliye' },
  { filename: 'Dyt. Ahmet Nerit DANÇ - beslenme ve diyet.jpg', name: 'Dyt. Ahmet Nerit Danç', title: 'Dyt.', deptSlug: 'beslenme-ve-diyet' },
  { filename: 'Op. Dr. Adem ÖZEL - göz sağlığı ve hastalıkları.jpg', name: 'Op. Dr. Adem Özel', title: 'Op. Dr.', deptSlug: 'goz-sagligi-ve-hastaliklari' },
  { filename: 'Op. Dr. Ahmet AKGÜN - kadın hastalıkları ve doğum.jpg', name: 'Op. Dr. Ahmet Akgün', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Op. Dr. Alperen ZEYNEL - ortopedi ve rehabilitasyon.jpg', name: 'Op. Dr. Alperen Zeynel', title: 'Op. Dr.', deptSlug: 'ortopedi-ve-travmatoloji' },
  { filename: 'Op. Dr. Faruk MOİN - kadın hastalıkları ve doğum.jpg', name: 'Op. Dr. Faruk Moin', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Op. Dr. Ferhat AVCI - - ortopedi ve rehabilitasyon.jpg', name: 'Op. Dr. Ferhat Avcı', title: 'Op. Dr.', deptSlug: 'ortopedi-ve-travmatoloji' },
  { filename: 'Op. Dr. Furkan Melih Koçak - kulak burun boğaz.jpg', name: 'Op. Dr. Furkan Melih Koçak', title: 'Op. Dr.', deptSlug: 'kulak-burun-bogaz' },
  { filename: 'Op. Dr. Hasan AKBULUT - genel cerrahi.jpg', name: 'Op. Dr. Hasan Akbulut', title: 'Op. Dr.', deptSlug: 'genel-cerrahi' },
  { filename: 'Op. Dr. Sabri Emin KARAÇOR - beyin ve sinir cerrahi.jpg', name: 'Op. Dr. Sabri Emin Karaçor', title: 'Op. Dr.', deptSlug: 'beyin-ve-sinir-cerrahisi' },
  { filename: 'Op. Dr. Özcan Karademir - kadın hastalıkları ve doğum.jpg', name: 'Op. Dr. Özcan Karademir', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Op. Dr. İmed Duksal - üroloji.jpg', name: 'Op. Dr. İmed Duksal', title: 'Op. Dr.', deptSlug: 'uroloji' },
  { filename: 'Op.Dr. Mehtap DURMUŞ ASLAN - kadın hastalıkları ve doğum.jpg', name: 'Op. Dr. Mehtap Durmuş Aslan', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Op.Dr.Ceren Aydın - kadın hastalıkları ve doğum.jpg', name: 'Op. Dr. Ceren Aydın', title: 'Op. Dr.', deptSlug: 'kadin-hastaliklari-ve-dogum' },
  { filename: 'Uzm. Dr. Ecem Ösken - çocuk sağlığı ve hastalıkları.jpg', name: 'Uzm. Dr. Ecem Ösken', title: 'Uzm. Dr.', deptSlug: 'cocuk-sagligi-ve-hastaliklari' },
  { filename: 'Uzm. Dr. Edebali ERDOĞAN - çocuk sağlığı ve hastalıkları.jpg', name: 'Uzm. Dr. Edebali Erdoğan', title: 'Uzm. Dr.', deptSlug: 'cocuk-sagligi-ve-hastaliklari' },
  { filename: 'Uzm. Dr. Fahriye Aylin GÜZEY - biyokimya.jpg', name: 'Uzm. Dr. Fahriye Aylin Güzey', title: 'Uzm. Dr.', deptSlug: 'biyokimya' },
  { filename: 'Uzm. Dr. Hakan TAĞRİKULU - anestezi ve reanimasyon.jpg', name: 'Uzm. Dr. Hakan Tağrikulı', title: 'Uzm. Dr.', deptSlug: 'anestezi-ve-reanimasyon' },
  { filename: 'Uzm. Dr. Kerim KADERİ - dermatoloji.jpg', name: 'Uzm. Dr. Kerim Kaderi', title: 'Uzm. Dr.', deptSlug: 'dermatoloji' },
  { filename: 'Uzm. Dr. Mehmet GÜMÜŞ - iç hastalıkları ( Dahiliye).jpg', name: 'Uzm. Dr. Mehmet Gümüş', title: 'Uzm. Dr.', deptSlug: 'ic-hastaliklari-dahiliye' },
  { filename: 'Uzm. Dr. Mesut YILDIZ - acil servis.jpg', name: 'Uzm. Dr. Mesut Yıldız', title: 'Uzm. Dr.', deptSlug: 'acil-servis' },
  { filename: 'Uzm. Dr. Muzaffer SARIAYDIN - göğüs hastalıkları.jpg', name: 'Uzm. Dr. Muzaffer Sarıaydın', title: 'Uzm. Dr.', deptSlug: 'gogus-hastaliklari' },
  { filename: 'Uzm. Dr. Seher BAKIRTAŞ - nöroloji.jpg', name: 'Uzm. Dr. Seher Bakırttaş', title: 'Uzm. Dr.', deptSlug: 'noroloji' },
  { filename: 'Uzm. Dr. Sema PEKSÖZ - çocuk sağlığı ve hastalıkları.jpg', name: 'Uzm. Dr. Sema Peksöz', title: 'Uzm. Dr.', deptSlug: 'cocuk-sagligi-ve-hastaliklari' },
  { filename: 'Uzm. Dr. Sibel KIRK - iç hastalıkları ( Dahiliye ).jpg', name: 'Uzm. Dr. Sibel Kirk', title: 'Uzm. Dr.', deptSlug: 'ic-hastaliklari-dahiliye' },
  { filename: 'Uzm. Dr. Sultan AY - çoculk sağlığı ve hastalıkları.jpg', name: 'Uzm. Dr. Sultan Ay', title: 'Uzm. Dr.', deptSlug: 'cocuk-sagligi-ve-hastaliklari' },
  { filename: 'Uzm. Dr. Telat ŞİMŞEK - radyoloji.jpg', name: 'Uzm. Dr. Telat Şimşek', title: 'Uzm. Dr.', deptSlug: 'radyoloji' },
  { filename: 'Uzm. Dr. İlhan YILMAZ - anestezi ve reanimasyon.jpg', name: 'Uzm. Dr. İlhan Yılmaz', title: 'Uzm. Dr.', deptSlug: 'anestezi-ve-reanimasyon' },
];

export async function seedAvcilarDoctors(
  hospitalIdMap: Record<string, number>,
  deptIdMap: Record<string, number>,
  onProgress: (p: SeedProgress) => void
): Promise<void> {
  const avcilarId = hospitalIdMap['ozel-avcilar-anadolu-hastanesi'];
  if (!avcilarId) {
    onProgress({ step: 'Avcılar Doktorları', status: 'error', detail: 'Avcılar hastane ID bulunamadı' });
    return;
  }

  onProgress({ step: 'Avcılar Doktorları', status: 'running', detail: 'Doktorlar yükleniyor...' });

  // Check if storage bucket exists, create if not
  await supabase.storage.createBucket('doctor-images', { public: true }).catch(() => {});

  let successCount = 0;
  let errorCount = 0;

  for (const doctor of AVCILAR_DOCTORS_DATA) {
    const slug = nameToSlug(doctor.name);

    const deptId = deptIdMap[doctor.deptSlug];
    if (!deptId) {
      onProgress({ step: 'Avcılar Doktorları', status: 'running', detail: `Bölüm bulunamadı (${doctor.deptSlug}): ${doctor.name}` });
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
        const storagePath = `avcilar/${slug}.${ext}`;

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
        onProgress({ step: 'Avcılar Doktorları', status: 'running', detail: `Resim güncellendi: ${doctor.name}` });
      } else {
        onProgress({ step: 'Avcılar Doktorları', status: 'running', detail: `Mevcut, atlandı: ${doctor.name}` });
      }
      continue;
    }

    const { error } = await supabase.from('doctors').insert([{
      name: doctor.name,
      slug,
      title: doctor.title,
      department_id: deptId,
      hospital_id: avcilarId,
      image: imageUrl,
      education: '',
      experience: '',
    }]);

    if (error) {
      onProgress({ step: 'Avcılar Doktorları', status: 'running', detail: `Hata: ${doctor.name} - ${error.message}` });
      errorCount++;
    } else {
      onProgress({ step: 'Avcılar Doktorları', status: 'running', detail: `Eklendi: ${doctor.name}` });
      successCount++;
    }
  }

  onProgress({
    step: 'Avcılar Doktorları',
    status: errorCount > 0 && successCount === 0 ? 'error' : 'done',
    detail: `${successCount} doktor eklendi, ${errorCount} hata`,
  });
}
