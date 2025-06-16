import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'signin' | 'signup';
}

const AuthModal = ({ isOpen, onClose, initialView = 'signin' }: AuthModalProps) => {
  const [view, setView] = useState<'signin' | 'signup'>(initialView);

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex">
              <button
                className={`flex-1 py-4 font-medium text-center transition-colors ${
                  view === 'signin'
                    ? 'bg-primary text-white'
                    : 'bg-neutral text-text-light hover:bg-neutral-dark'
                }`}
                onClick={() => setView('signin')}
              >
                Giriş Yap
              </button>
              <button
                className={`flex-1 py-4 font-medium text-center transition-colors ${
                  view === 'signup'
                    ? 'bg-primary text-white'
                    : 'bg-neutral text-text-light hover:bg-neutral-dark'
                }`}
                onClick={() => setView('signup')}
              >
                Kayıt Ol
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
