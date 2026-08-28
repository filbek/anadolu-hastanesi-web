-- ============================================================
-- Anadolu Hastaneleri Grubu - HBYS randevu ID'lerinin toplu yüklenmesi
--
-- Kaynak: public/Pusula_doktor.xlsx  -> physicianId  = "Personel No"
--         public/bolum-brans-id.xlsx -> departmentId = "MobileId"
--
-- Şema ve link kurulumu için bkz. hbys_appointment_ids_migration.sql
-- ve src/utils/appointmentUrl.ts.
--
-- Eşleştirme kuralları:
--   * Excel doktoru "Adı + Soyadı" ile doctors.name eşleştirildi; ünvan
--     ekleri atıldı, Türkçe karakterler normalize edildi.
--   * Excel "Bölüm" alanının son eki şubeyi verir: -SLV -> hospitals.id 4,
--     -AVC -> 5, -ERG -> 6. Eşleşme için ismin yanı sıra şubenin de
--     tutması şart (aynı isim iki şubede bulunabilir).
--   * Bölüm kodu Excel'in bölüm ADINDAN değil, eşleşen doktorun kendi
--     department_id'sinden türetildi; site bölüm adları Excel'dekiyle
--     birebir değil (örn. Excel "Göz Hastalıkları" -> site "Göz Sağlığı
--     ve Hastalıkları").
--   * Bir doktorun Pusula'da birden çok kaydı varsa site bölümüyle en çok
--     örtüşen satır seçildi (örn. Halil Narlı: İşyeri Hekimliği yerine
--     Nöroloji -> 40).
--   * Evlilik/ikinci ad farkı olan 7 kayıt (örn. site "Hakan Koyuncu" ->
--     Pusula "HASBEY HAKAN KOYUNCU") aynı şube + aynı bölüm şartıyla
--     benzerlik üzerinden eşleştirildi.
--
-- NOT: MobileId şubeye göre değişmiyor (Genel Cerrahi üç şubede de 1900),
-- bu yüzden aynı bölüm kodu ilgili tüm şubelere yazılır.
--
-- Kapsam: 128 doktor, 71 (şube, bölüm) satırı.
-- Idempotent. Çalıştırma: Supabase SQL Editor'a yapıştırıp Run.
-- ============================================================

-- ---------- 1) Bölüm kodları (departmentId) ----------

INSERT INTO public.hospital_department_hbys (hospital_id, department_id, hbys_department_id) VALUES
  (4, 1, '1100'),  -- Silivri (SLV) / Kardiyoloji
  (4, 2, '1300'),  -- Silivri (SLV) / Nöroloji
  (4, 3, '2600'),  -- Silivri (SLV) / Ortopedi ve Travmatoloji
  (4, 4, '1900'),  -- Silivri (SLV) / Genel Cerrahi
  (4, 7, '3000'),  -- Silivri (SLV) / Kadın Hastalıkları ve Doğum
  (4, 9, '2800'),  -- Silivri (SLV) / Kulak Burun Boğaz (KBB)
  (4, 10, '2700'),  -- Silivri (SLV) / Üroloji
  (4, 11, '1700'),  -- Silivri (SLV) / Dermatoloji
  (4, 12, '3300'),  -- Silivri (SLV) / Radyoloji
  (4, 14, '1800'),  -- Silivri (SLV) / Fizik Tedavi ve Rehabilitasyon
  (4, 15, '1400'),  -- Silivri (SLV) / Psikiyatri
  (4, 16, '4400'),  -- Silivri (SLV) / Acil Servis
  (4, 17, '7005'),  -- Silivri (SLV) / Ağız ve Diş Sağlığı
  (4, 18, '3198'),  -- Silivri (SLV) / Algoloji (Ağrı)
  (4, 19, '3100'),  -- Silivri (SLV) / Anestezi ve Reanimasyon
  (4, 20, '6060'),  -- Silivri (SLV) / Beslenme ve Diyet
  (4, 21, '2400'),  -- Silivri (SLV) / Beyin ve Sinir Cerrahisi
  (4, 24, '2000'),  -- Silivri (SLV) / Çocuk Cerrahisi
  (4, 26, '1500'),  -- Silivri (SLV) / Çocuk Sağlığı ve Hastalıkları
  (4, 30, '1078'),  -- Silivri (SLV) / Endokrinoloji ve Metabolizma
  (4, 31, '1200'),  -- Silivri (SLV) / Enfeksiyon Hastalıkları ve Mikrobiyoloji
  (4, 33, '3372'),  -- Silivri (SLV) / Girişimsel Radyoloji
  (4, 34, '1171'),  -- Silivri (SLV) / Göğüs Hastalıkları
  (4, 35, '2900'),  -- Silivri (SLV) / Göz Sağlığı ve Hastalıkları
  (4, 36, '1000'),  -- Silivri (SLV) / İç Hastalıkları (Dahiliye)
  (4, 37, '2300'),  -- Silivri (SLV) / Kalp ve Damar Cerrahisi
  (4, 39, '1053'),  -- Silivri (SLV) / Medikal Onkoloji
  (4, 40, '1062'),  -- Silivri (SLV) / Nefroloji
  (4, 42, '3500'),  -- Silivri (SLV) / Patoloji
  (4, 43, '2500'),  -- Silivri (SLV) / Plastik Rekonstrüktif ve Estetik Cerrahi
  (5, 1, '1100'),  -- Avcılar (AVC) / Kardiyoloji
  (5, 2, '1300'),  -- Avcılar (AVC) / Nöroloji
  (5, 3, '2600'),  -- Avcılar (AVC) / Ortopedi ve Travmatoloji
  (5, 4, '1900'),  -- Avcılar (AVC) / Genel Cerrahi
  (5, 7, '3000'),  -- Avcılar (AVC) / Kadın Hastalıkları ve Doğum
  (5, 9, '2800'),  -- Avcılar (AVC) / Kulak Burun Boğaz (KBB)
  (5, 10, '2700'),  -- Avcılar (AVC) / Üroloji
  (5, 11, '1700'),  -- Avcılar (AVC) / Dermatoloji
  (5, 12, '3300'),  -- Avcılar (AVC) / Radyoloji
  (5, 14, '1800'),  -- Avcılar (AVC) / Fizik Tedavi ve Rehabilitasyon
  (5, 16, '4400'),  -- Avcılar (AVC) / Acil Servis
  (5, 19, '3100'),  -- Avcılar (AVC) / Anestezi ve Reanimasyon
  (5, 20, '6060'),  -- Avcılar (AVC) / Beslenme ve Diyet
  (5, 21, '2400'),  -- Avcılar (AVC) / Beyin ve Sinir Cerrahisi
  (5, 22, '3700'),  -- Avcılar (AVC) / Biyokimya
  (5, 26, '1500'),  -- Avcılar (AVC) / Çocuk Sağlığı ve Hastalıkları
  (5, 34, '1171'),  -- Avcılar (AVC) / Göğüs Hastalıkları
  (5, 35, '2900'),  -- Avcılar (AVC) / Göz Sağlığı ve Hastalıkları
  (5, 36, '1000'),  -- Avcılar (AVC) / İç Hastalıkları (Dahiliye)
  (6, 1, '1100'),  -- Ereğli (ERG) / Kardiyoloji
  (6, 2, '1300'),  -- Ereğli (ERG) / Nöroloji
  (6, 3, '2600'),  -- Ereğli (ERG) / Ortopedi ve Travmatoloji
  (6, 4, '1900'),  -- Ereğli (ERG) / Genel Cerrahi
  (6, 7, '3000'),  -- Ereğli (ERG) / Kadın Hastalıkları ve Doğum
  (6, 9, '2800'),  -- Ereğli (ERG) / Kulak Burun Boğaz (KBB)
  (6, 10, '2700'),  -- Ereğli (ERG) / Üroloji
  (6, 11, '1700'),  -- Ereğli (ERG) / Dermatoloji
  (6, 12, '3300'),  -- Ereğli (ERG) / Radyoloji
  (6, 14, '1800'),  -- Ereğli (ERG) / Fizik Tedavi ve Rehabilitasyon
  (6, 16, '4400'),  -- Ereğli (ERG) / Acil Servis
  (6, 19, '3100'),  -- Ereğli (ERG) / Anestezi ve Reanimasyon
  (6, 20, '6060'),  -- Ereğli (ERG) / Beslenme ve Diyet
  (6, 21, '2400'),  -- Ereğli (ERG) / Beyin ve Sinir Cerrahisi
  (6, 22, '3700'),  -- Ereğli (ERG) / Biyokimya
  (6, 26, '1500'),  -- Ereğli (ERG) / Çocuk Sağlığı ve Hastalıkları
  (6, 31, '1200'),  -- Ereğli (ERG) / Enfeksiyon Hastalıkları ve Mikrobiyoloji
  (6, 34, '1171'),  -- Ereğli (ERG) / Göğüs Hastalıkları
  (6, 35, '2900'),  -- Ereğli (ERG) / Göz Sağlığı ve Hastalıkları
  (6, 36, '1000'),  -- Ereğli (ERG) / İç Hastalıkları (Dahiliye)
  (6, 39, '1053'),  -- Ereğli (ERG) / Medikal Onkoloji
  (6, 44, '7000')  -- Ereğli (ERG) / Psikoloji
ON CONFLICT (hospital_id, department_id) DO UPDATE
  SET hbys_department_id = EXCLUDED.hbys_department_id,
      updated_at = now();

-- ---------- 2) Doktor kodları (physicianId) ----------

UPDATE public.doctors AS d
SET hbys_physician_id = v.pid
FROM (VALUES
  (64, '2730'),  -- Dr. Hüseyin Deniz Aksoku (Silivri (SLV))
  (65, '67'),  -- Dr. Ülken Sezer (Silivri (SLV))
  (66, '33'),  -- Doç. Dr. Fatih Kuzu (Silivri (SLV))
  (67, '3768'),  -- Doç. Dr. Gülşah Yıldırım (Silivri (SLV))
  (68, '66'),  -- Doç. Dr. Salih İnal (Silivri (SLV))
  (69, '23'),  -- Doç. Dr. Çağdaş Pamuk (Silivri (SLV))
  (70, '47'),  -- Doç. Dr. İbak Gönen (Silivri (SLV))
  (72, '4070'),  -- Doç. Dr. İlteriş Ahmet Şentürk (Silivri (SLV))
  (73, '16'),  -- Dr. Ersin Kahraman (Silivri (SLV))
  (74, '21'),  -- Dr. Öğr. Üyesi Ali Karaçınar (Silivri (SLV))
  (75, '8'),  -- Dr. Öğr. Üyesi Ali Kocaoğlu (Silivri (SLV))
  (78, '40'),  -- Dr. Öğr. Üyesi Halil Narlı (Silivri (SLV))
  (79, '3417'),  -- Dr. Öğr. Üyesi Emrah Çiçek (Silivri (SLV))
  (80, '55'),  -- Dt. Mehmet Büdüş (Silivri (SLV))
  (82, '3756'),  -- Dyt. Benan Koç (Silivri (SLV))
  (83, '32'),  -- Op. Dr. Doğan Durmazer (Silivri (SLV))
  (84, '25'),  -- Op. Dr. Duygu Yardım (Silivri (SLV))
  (85, '3713'),  -- Op. Dr. Ekrem Çancılar (Silivri (SLV))
  (86, '28'),  -- Op. Dr. Ercan Yalçın (Silivri (SLV))
  (87, '36'),  -- Op. Dr. Eyüp Baykara (Silivri (SLV))
  (88, '34'),  -- Op. Dr. Fümerel İnce (Silivri (SLV))
  (89, '60'),  -- Op. Dr. Nilay Çiçek (Silivri (SLV))
  (90, '3314'),  -- Op. Dr. Seçil Soydan (Silivri (SLV))
  (91, '2732'),  -- Op. Dr. Talha Atalay (Silivri (SLV))
  (92, '61'),  -- Op. Dr. Özgür Irmak (Silivri (SLV))
  (93, '70'),  -- Op. Dr. Ülker Moralar (Silivri (SLV))
  (94, '3399'),  -- Op. Dr. Ümit Beyatlı (Silivri (SLV))
  (95, '3828'),  -- Op. Dr. Akın Gökçedağ (Silivri (SLV))
  (96, '26'),  -- Op. Dr. Emre Özdengil (Silivri (SLV))
  (97, '3480'),  -- Op. Dr. Fatma Selmin Madran (Silivri (SLV))
  (98, '3461'),  -- Op. Dr. Hafize Çamdere (Silivri (SLV))
  (99, '3832'),  -- Op. Dr. Mehmet Özgür Çetkin (Silivri (SLV))
  (100, '3433'),  -- Op. Dr. Oğuz Gürgen (Silivri (SLV))
  (101, '3343'),  -- Prof. Dr. Kemal Korkmaz (Silivri (SLV))
  (102, '59'),  -- Prof. Dr. Niyazi Güler (Silivri (SLV))
  (103, '69'),  -- Prof. Dr. Suphi Bulğurcu (Silivri (SLV))
  (104, '3993'),  -- Prof. Dr. Hakan Koyuncu (Silivri (SLV))
  (105, '20'),  -- Uzm. Dr. Ahmet Hakan Dikener (Silivri (SLV))
  (106, '29'),  -- Uzm. Dr. Altay Tolga Şentürk (Silivri (SLV))
  (107, '22'),  -- Uzm. Dr. Belgin Uysal Erdal (Silivri (SLV))
  (109, '24'),  -- Uzm. Dr. Dilek Özkök Kızılca (Silivri (SLV))
  (110, '31'),  -- Uzm. Dr. Faik Üçüncü (Silivri (SLV))
  (112, '41'),  -- Uzm. Dr. Hatice Okur (Silivri (SLV))
  (114, '3369'),  -- Uzm. Dr. Serap Çakır (Silivri (SLV))
  (115, '68'),  -- Uzm. Dr. Serkan Gökçay (Silivri (SLV))
  (116, '37'),  -- Uzm. Dr. Veli Yaman (Silivri (SLV))
  (117, '72'),  -- Uzm. Dr. Veysi Asoğlu (Silivri (SLV))
  (118, '3767'),  -- Uzm. Dr. İnci İnce (Silivri (SLV))
  (119, '3560'),  -- Uzm. Dr. Şirin Erkaya İnel (Silivri (SLV))
  (120, '27'),  -- Uzm. Dyt. Ahu Özvar Kuzu (Silivri (SLV))
  (122, '3427'),  -- Uzm. Dr. Ahmet Telis (Avcılar (AVC))
  (123, '3617'),  -- Uzm. Dr. Nalan Yağmur (Silivri (SLV))
  (124, '3831'),  -- Uzm. Dr. Sevil Baş (Silivri (SLV))
  (125, '3416'),  -- Uzm. Dr. Volkan Hepyanar (Silivri (SLV))
  (126, '4147'),  -- Uzm. Dr. Zeynep Güvenç (Silivri (SLV))
  (127, '3102'),  -- Dr. Uğur Kurt (Ereğli (ERG))
  (128, '3583'),  -- Dr. Shadi Barani (Ereğli (ERG))
  (129, '3098'),  -- Dyt. Sena Yalçın (Ereğli (ERG))
  (130, '3764'),  -- Op. Dr. Alev Uygun (Ereğli (ERG))
  (131, '3081'),  -- Op. Dr. Derya Kulaç Karadeniz (Ereğli (ERG))
  (132, '3082'),  -- Op. Dr. Emin Damgacı (Ereğli (ERG))
  (133, '3076'),  -- Op. Dr. Osman Gençoğlu (Ereğli (ERG))
  (134, '4036'),  -- Op. Dr. Selami Altuntaş (Ereğli (ERG))
  (136, '3948'),  -- Op. Dr. Evrim Balbaloğlu (Ereğli (ERG))
  (138, '3659'),  -- Uzm. Dr. Erhan Oğur (Ereğli (ERG))
  (139, '3331'),  -- Uzm. Dr. Gökçe Akman Köse (Ereğli (ERG))
  (140, '3725'),  -- Uzm. Dr. Hasan Meral (Ereğli (ERG))
  (141, '3084'),  -- Uzm. Dr. Hasan Yılmaz (Ereğli (ERG))
  (142, '3085'),  -- Uzm. Dr. Hülya Atik Molon (Ereğli (ERG))
  (143, '3086'),  -- Uzm. Dr. Lütfi Molon (Ereğli (ERG))
  (144, '3818'),  -- Uzm. Dr. Nigar Rustamova (Ereğli (ERG))
  (145, '3090'),  -- Uzm. Dr. Ramazan Atagün (Ereğli (ERG))
  (146, '3091'),  -- Uzm. Dr. Sadi Yetkili (Ereğli (ERG))
  (147, '3099'),  -- Uzm. Dr. Serdal Dalkün (Ereğli (ERG))
  (148, '3096'),  -- Uzm. Dr. Veyis Turan (Ereğli (ERG))
  (149, '3095'),  -- Uzm. Dr. Yaşar Baykal (Ereğli (ERG))
  (150, '3094'),  -- Uzm. Dr. Ülkü Turpcu Eriğmen (Ereğli (ERG))
  (151, '3107'),  -- Uzm. Klinik Psikolog Büşra Yılmaz (Ereğli (ERG))
  (152, '3750'),  -- Dr. Aynur Karakaya (Ereğli (ERG))
  (153, '3915'),  -- Dr. Muhammed Ertürk (Ereğli (ERG))
  (154, '3087'),  -- Dr. Muzaffer Güngör (Ereğli (ERG))
  (155, '3088'),  -- Op. Dr. Olcay Çınar (Ereğli (ERG))
  (156, '3093'),  -- Op. Dr. Selcan Kesgin (Ereğli (ERG))
  (157, '3519'),  -- Op. Dr. Volkan Tutuş (Ereğli (ERG))
  (158, '3074'),  -- Uzm. Dr. Evlin Görgülü (Ereğli (ERG))
  (161, '2968'),  -- Doç. Dr. Figen Koçyiğit (Avcılar (AVC))
  (162, '3373'),  -- Dr. Ercan Yaşa (Avcılar (AVC))
  (163, '2957'),  -- Dr. Öğr. Üyesi Mehmet Köroğlu (Avcılar (AVC))
  (165, '2975'),  -- Op. Dr. Adem Özel (Avcılar (AVC))
  (166, '3345'),  -- Op. Dr. Ahmet Akgün (Avcılar (AVC))
  (167, '2970'),  -- Op. Dr. Alperen Zeynel (Avcılar (AVC))
  (168, '4148'),  -- Op. Dr. Faruk Moin (Avcılar (AVC))
  (169, '3943'),  -- Op. Dr. Ferhat Avcı (Avcılar (AVC))
  (170, '4157'),  -- Op. Dr. Furkan Melih Koçak (Avcılar (AVC))
  (171, '2964'),  -- Op. Dr. Hasan Akbulut (Avcılar (AVC))
  (172, '2878'),  -- Op. Dr. Sabri Emin Karaçor (Avcılar (AVC))
  (173, '2951'),  -- Op. Dr. Özcan Karademir (Avcılar (AVC))
  (174, '3035'),  -- Op. Dr. İmed Duksal (Avcılar (AVC))
  (175, '2956'),  -- Op. Dr. Mehtap Durmuş Aslan (Avcılar (AVC))
  (176, '3347'),  -- Op. Dr. Ceren Aydın (Avcılar (AVC))
  (177, '2969'),  -- Uzm. Dr. Ecem Ösken (Avcılar (AVC))
  (178, '2976'),  -- Uzm. Dr. Edebali Erdoğan (Avcılar (AVC))
  (179, '2887'),  -- Uzm. Dr. Fahriye Aylin Güzey (Avcılar (AVC))
  (180, '2960'),  -- Uzm. Dr. Kerim Kaderi (Avcılar (AVC))
  (181, '2959'),  -- Uzm. Dr. Mehmet Gümüş (Avcılar (AVC))
  (182, '2875'),  -- Uzm. Dr. Mesut Yıldız (Avcılar (AVC))
  (183, '2954'),  -- Uzm. Dr. Muzaffer Sarıaydın (Avcılar (AVC))
  (184, '3645'),  -- Uzm. Dr. Seher Bakırttaş (Avcılar (AVC))
  (185, '2950'),  -- Uzm. Dr. Sema Peksöz (Avcılar (AVC))
  (186, '2949'),  -- Uzm. Dr. Sibel Kirk (Avcılar (AVC))
  (187, '2892'),  -- Uzm. Dr. Sultan Ay (Avcılar (AVC))
  (188, '2948'),  -- Uzm. Dr. Telat Şimşek (Avcılar (AVC))
  (189, '4002'),  -- Uzm. Dr. İlhan Yılmaz (Avcılar (AVC))
  (191, '4297'),  -- Op.Dr. Emre ÇAVUŞ (Silivri (SLV))
  (192, '4216'),  -- Op.Dr. Ece Çavuş (Silivri (SLV))
  (193, '4253'),  -- Prof. Suna ÇOKMERT (Silivri (SLV))
  (194, '4217'),  -- Doç.Dr. İlknur İNEGÖL (Silivri (SLV))
  (195, '4277'),  -- Ezgi GENÇ KÖROĞLU (Ereğli (ERG))
  (196, '4219'),  -- Uzm. Dr. Murat ÖZDAMAR (Ereğli (ERG))
  (197, '4218'),  -- Op. Dr. Erol GÜNEN (Ereğli (ERG))
  (198, '4286'),  -- Uzm.Dr Serdar KARA (Silivri (SLV))
  (199, '4285'),  -- Uzm.Dr. Metin YILDIZ (Silivri (SLV))
  (201, '2965'),  -- Op. Dr. Haluk ÇİMEN (Avcılar (AVC))
  (202, '4316'),  -- Uzm. Dr. Emrah YILMAZ (Ereğli (ERG))
  (203, '4332'),  -- Uzm. Dr. Çağrı Arda HATİPOĞLU (Ereğli (ERG))
  (204, '4338'),  -- Op. Dr. Mustafa ALİBABA (Ereğli (ERG))
  (205, '4340'),  -- Doç. Dr. Özkan Sever (Silivri (SLV))
  (206, '4376')  -- Dyt. Zeynep Ecem Özuzun (Avcılar (AVC))
) AS v(id, pid)
WHERE d.id = v.id;

NOTIFY pgrst, 'reload schema';

-- ---------- 3) Pusula'da karşılığı bulunamayan site doktorları ----------
-- Aşağıdaki 11 doktor için physicianId yazılmadı. Randevu linkleri şube +
-- bölüm kırılımında kalır (kırık olmaz, sadece doktoru seçili gelmez).
-- Pusula'dan Personel No temin edilince admin panelindeki doktor düzenleme
-- kartından ya da bu dosyaya satır eklenerek tamamlanabilir.
--
-- Not: "Hakan Taşrikulü" Pusula'da Avcılar-Anestezi altında görünüyor;
-- doğrusu Silivri (28.08.2026 tarihinde teyit edildi). Pusula kaydı şubeyi
-- yanlış gösterdiği için physicianId bilerek yazılmadı.

--   #71   Doç. Dr. Murat Saygı                       Silivri   Çocuk Kardiyoloji
--   #76   Dr. Öğr. Üyesi Habibe Duman                Silivri   İç Hastalıkları (Dahiliye)
--   #77   Dr. İbrahim Barış Parlak                   Silivri   Ağız ve Diş Sağlığı
--   #81   Dt. Yasemin Has                            Silivri   Ağız ve Diş Sağlığı
--   #108  Uzm. Dr. Bilgehan Efeoğulları              Silivri   Radyoloji
--   #111  Uzm. Dr. Hakan Tağrikulı                   Silivri   Anestezi ve Reanimasyon
--   #113  Uzm. Dr. Murat Gençay                      Silivri   İç Hastalıkları (Dahiliye)
--   #121  Uzm. Klinik Psikolog Yaren Gülşen          Silivri   Psikoloji
--   #164  Dyt. Ahmet Nerit Danç                      Avcılar   Beslenme ve Diyet
--   #137  Uzm. Dr. Ceyhun Memmedov                   Ereğli    Kardiyoloji
--   #159  Uzm. Dr. Mutlu Çayırlı                     Ereğli    Dermatoloji
