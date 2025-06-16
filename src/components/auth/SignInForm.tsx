import { useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { UserCredentials } from '../../lib/supabase';

interface SignInFormProps {
  onSuccess?: () => void;
  onSignUpClick?: () => void;
}

const SignInForm = ({ onSuccess, onSignUpClick }: SignInFormProps) => {
  const { signIn } = useSupabase();
  const [credentials, setCredentials] = useState<UserCredentials>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(credentials);

      if (error) {
        setError(error.message);
        return;
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-semibold text-primary mb-6">Giriş Yap</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
            E-posta
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            className="input-field"
            required
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
            value={credentials.password}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <div className="text-right">
          <a href="#" className="text-sm text-primary hover:text-primary-dark transition-colors">
            Şifremi Unuttum
          </a>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-text-light">
          Hesabınız yok mu?{' '}
          <button
            onClick={onSignUpClick}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            Kayıt Ol
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
