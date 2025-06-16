import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserCredentials, NewUser, UserProfile } from '../lib/supabase';

type SupabaseContextType = {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (userData: NewUser) => Promise<{ error: any | null; data: any | null }>;
  signIn: (credentials: UserCredentials) => Promise<{ error: any | null; data: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ error: any | null; data: any | null }>;
  uploadAvatar: (file: File) => Promise<{ error: any | null; url: string | null }>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }

    setUserProfile(data as UserProfile);
  };

  const signUp = async ({ email, password, full_name, phone }: NewUser) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            phone,
          },
        },
      });

      if (error) {
        return { error, data: null };
      }

      if (data.user) {
        // Create user profile
        // Admin ve super_admin email için admin rolü ata
        let role = 'user';
        if (email === 'admin@anadoluhastaneleri.com') {
          role = 'admin';
        } else if (email === 'sagliktruizmi34@gmail.com') {
          role = 'super_admin';
        }

        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name,
            email,
            phone,
            role,
          },
        ]);

        if (profileError) {
          return { error: profileError, data: null };
        }
      }

      return { data, error: null };
    } catch (error) {
      return { error, data: null };
    }
  };

  const signIn = async ({ email, password }: UserCredentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { data, error };
    } catch (error) {
      return { error, data: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { error, data: null };
      }

      // Update local state
      setUserProfile((prev) => {
        if (!prev) return null;
        return { ...prev, ...profile };
      });

      return { data, error: null };
    } catch (error) {
      return { error, data: null };
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file);

      if (uploadError) {
        return { error: uploadError, url: null };
      }

      const { data } = supabase.storage.from('user-avatars').getPublicUrl(filePath);
      const avatarUrl = data.publicUrl;

      // Update user profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: avatarUrl });

      if (updateError) {
        return { error: updateError, url: null };
      }

      return { error: null, url: avatarUrl };
    } catch (error) {
      return { error, url: null };
    }
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadAvatar,
  };

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}
