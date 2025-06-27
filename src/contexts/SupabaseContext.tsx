import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabaseNew as supabase, UserCredentials, NewUser, UserProfile } from '../lib/supabase-new';

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 User found, fetching profile...');

        // Temporary fix: Set admin profile directly for known admin emails
        if (session.user.email === 'sagliktruizmi34@gmail.com') {
          console.log('🔧 Setting super admin profile directly');
          setUserProfile({
            id: session.user.id,
            email: session.user.email,
            full_name: 'Super Admin',
            role: 'super_admin'
          });
        } else if (session.user.email === 'bekir.filizdag@anadoluhastaneleri.com') {
          console.log('🔧 Setting admin profile directly');
          setUserProfile({
            id: session.user.id,
            email: session.user.email,
            full_name: 'Bekir Filizdag',
            role: 'admin'
          });
        } else {
          await fetchUserProfile(session.user.id);
        }
      } else {
        console.log('❌ No user, clearing profile');
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile fetch error:', error);

        // If profile doesn't exist, create one for admin users
        const userEmail = await getUserEmail(userId);
        if (userEmail && (userEmail === 'sagliktruizmi34@gmail.com' || userEmail === 'bekir.filizdag@anadoluhastaneleri.com')) {
          console.log('🔧 Creating missing admin profile...');
          await createAdminProfile(userId, userEmail);
          return;
        }
        return;
      }

      if (data) {
        console.log('✅ Profile fetched:', data);
        setUserProfile(data as UserProfile);
      } else {
        console.log('⚠️ No profile found, checking if admin user...');
        const userEmail = await getUserEmail(userId);
        if (userEmail && (userEmail === 'sagliktruizmi34@gmail.com' || userEmail === 'bekir.filizdag@anadoluhastaneleri.com')) {
          console.log('🔧 Creating admin profile...');
          await createAdminProfile(userId, userEmail);
        }
      }
    } catch (error) {
      console.error('💥 Error fetching user profile:', error);
    }
  };

  const getUserEmail = async (userId: string) => {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      if (error) {
        // Fallback: get from current session
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user?.email;
      }
      return data.user?.email;
    } catch {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.email;
    }
  };

  const createAdminProfile = async (userId: string, email: string) => {
    try {
      const role = email === 'sagliktruizmi34@gmail.com' ? 'super_admin' : 'admin';
      const fullName = email === 'sagliktruizmi34@gmail.com' ? 'Super Admin' : 'Bekir Filizdag';

      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email,
          full_name: fullName,
          role
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating admin profile:', error);
        return;
      }

      console.log('✅ Admin profile created:', data);
      setUserProfile(data as UserProfile);
    } catch (error) {
      console.error('💥 Error creating admin profile:', error);
    }
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
      console.log('🔐 SignIn attempt with:', email);
      console.log('🔗 Supabase client URL:', (supabase as any).supabaseUrl);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ SignIn error:', error);
      } else {
        console.log('✅ SignIn successful, full data:', data);
        console.log('🔍 User object:', data.user);
        console.log('🔍 Session object:', data.session);

        if (data.user) {
          console.log('✅ User found:', data.user.email);
        console.log('🔍 User email check:', data.user.email, typeof data.user.email);
        console.log('🔍 Email comparison:', data.user.email === 'sagliktruizmi34@gmail.com');

        // Always set user and session first
        setUser(data.user);
        setSession(data.session);

        // Immediately set profile for admin users
        if (data.user.email === 'sagliktruizmi34@gmail.com') {
          console.log('🔧 Setting super admin profile after login');
          setUserProfile({
            id: data.user.id,
            email: data.user.email,
            full_name: 'Super Admin',
            role: 'super_admin'
          });
        } else if (data.user.email === 'bekir.filizdag@anadoluhastaneleri.com') {
          console.log('🔧 Setting admin profile after login');
          setUserProfile({
            id: data.user.id,
            email: data.user.email,
            full_name: 'Bekir Filizdag',
            role: 'admin'
          });
        } else {
          console.log('⚠️ Not an admin email, fetching profile from database');
          await fetchUserProfile(data.user.id);
        }
        } else {
          console.log('❌ No user in response data');
        }
      }

      return { data, error };
    } catch (error) {
      console.error('💥 SignIn exception:', error);
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
