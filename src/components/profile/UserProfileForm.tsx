import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { UserProfile } from '../../lib/supabase';

const UserProfileForm = () => {
  const { userProfile, updateProfile, uploadAvatar } = useSupabase();
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    full_name: '',
    email: '',
    phone: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (userProfile) {
      setProfile({
        full_name: userProfile.full_name,
        email: userProfile.email,
        phone: userProfile.phone || '',
      });
      
      if (userProfile.avatar_url) {
        setAvatarPreview(userProfile.avatar_url);
      }
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Upload avatar if selected
      if (avatarFile) {
        const { url, error: uploadError } = await uploadAvatar(avatarFile);
        
        if (uploadError) {
          throw new Error('Avatar yüklenirken bir hata oluştu.');
        }
      }

      // Update profile
      const { error } = await updateProfile(profile);
      
      if (error) {
        throw new Error(error.message);
      }

      setMessage({
        type: 'success',
        text: 'Profil başarıyla güncellendi.',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Profil güncellenirken bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="card p-6">
        <p className="text-center text-text-light">Lütfen giriş yapın.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-semibold text-primary mb-6">Profil Bilgilerim</h2>
      
      {message && (
        <div
          className={`${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          } border px-4 py-3 rounded mb-4`}
        >
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-neutral">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                <i className="bi bi-person-fill text-4xl"></i>
              </div>
            )}
          </div>
          
          <label className="btn btn-outline cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            Profil Fotoğrafı Değiştir
          </label>
        </div>
        
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-text mb-1">
            Ad Soyad
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
            E-posta
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email}
            className="input-field bg-neutral"
            disabled
          />
          <p className="text-xs text-text-light mt-1">E-posta adresi değiştirilemez.</p>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text mb-1">
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={profile.phone || ''}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
