import { useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { NewUser } from '../../lib/supabase';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSignInClick?: () => void;
}

const SignUpForm = ({ onSuccess, onSignInClick }: SignUpFormProps) => {
  const { signUp } = useSupabase();
  const [userData, setUserData] = useState<NewUser>({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate password match
    if (userData.password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(userData);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess('Kayıt başarılı! E-posta adresinize gönderilen onay bağlantısını kontrol edin.');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Kayıt olurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-semibold text-primary mb-6">Kayıt Ol</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-text mb-1">
            Ad Soyad
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={userData.full_name}
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
            value={userData.email}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text mb-1">
            Telefon (İsteğe Bağlı)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={userData.phone}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
            Şifre
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            className="input-field"
            required
            minLength={6}
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-1">
            Şifre Tekrar
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            required
            minLength={6}
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-text-light">
          Zaten hesabınız var mı?{' '}
          <button
            onClick={onSignInClick}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            Giriş Yap
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
