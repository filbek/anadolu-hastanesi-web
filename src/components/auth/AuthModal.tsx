import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'signin' | 'signup';
}

const AuthModal = ({ isOpen, onClose, initialView = 'signin' }: AuthModalProps) => {
  const { t } = useTranslation();
  const [view, setView] = useState<'signin' | 'signup'>(initialView);
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  const handleSuccess = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={view === 'signin' ? t('auth.signIn', 'Giriş Yap') : t('auth.signUp', 'Kayıt Ol')}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close', 'Kapat')}
              className="absolute top-2 right-2 z-10 w-11 h-11 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-primary transition-colors"
            >
              <FaTimes aria-hidden="true" />
            </button>

            <div className="flex" role="tablist" aria-label={t('auth.authTabs', 'Kimlik doğrulama')}>
              <button
                role="tab"
                aria-selected={view === 'signin'}
                className={`flex-1 py-4 font-medium text-center transition-colors ${
                  view === 'signin'
                    ? 'bg-primary text-white'
                    : 'bg-neutral text-text-light hover:bg-neutral-dark'
                }`}
                onClick={() => setView('signin')}
              >
                {t('auth.signIn','Giriş Yap')}
              </button>
              <button
                role="tab"
                aria-selected={view === 'signup'}
                className={`flex-1 py-4 font-medium text-center transition-colors ${
                  view === 'signup'
                    ? 'bg-primary text-white'
                    : 'bg-neutral text-text-light hover:bg-neutral-dark'
                }`}
                onClick={() => setView('signup')}
              >
                {t('auth.signUp','Kayıt Ol')}
              </button>
            </div>

            <div className="p-6">
              {view === 'signin' ? (
                <SignInForm
                  onSuccess={handleSuccess}
                  onSignUpClick={() => setView('signup')}
                />
              ) : (
                <SignUpForm
                  onSuccess={handleSuccess}
                  onSignInClick={() => setView('signin')}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
