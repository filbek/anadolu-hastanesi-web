// Bölüm görselleri.
//
// Bölüm görseli admin panelinden yüklenir (department.image_url /
// department.images). Daha önce kayıtta görsel yoksa Unsplash stok
// fotoğraflarına düşülüyordu; bu fotoğraflarda kurumumuza ait olmayan
// hekimler göründüğü için kaldırıldı. Görsel yoksa sayfa kurumsal renkli
// banner'ı gösterir.

/**
 * <img onError> için: adres yüklenemezse görseli gizler, böylece altındaki
 * kurumsal renkli arka plan görünür.
 */
export function handleDepartmentImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = 'none';
}
