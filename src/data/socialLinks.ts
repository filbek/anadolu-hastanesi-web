/** Kurumsal sosyal medya hesapları — Footer ve çağrı merkezi popup'ı ortak kullanır. */
export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'linkedin'

export interface SocialLink {
  id: SocialPlatform
  label: string
  href: string
}

export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/anadoluhastanelergrubu' },
  { id: 'twitter', label: 'Twitter', href: 'https://x.com/AnadoluHast' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/anadoluhastanelergrubu/' },
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/channel/UCCTPl8oKtJ0IeEeCEBvcXHw' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/anadolu-hastaneleri-grubu' },
]
