import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { type User, type UserRole, AUTH_STORAGE_KEYS } from '../utils/auth';
import { stopBgMusic } from '../utils/bgMusic';
import { supabase } from '../lib/supabase';
import {
  isAuthorizedAdminEmail,
  isAuthorizedViewerEmail,
  getResolvedEmailForInput,
} from '../config/auth.config';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifierInput: string, passwordInput: string, rememberMe?: boolean) => Promise<{ success: boolean; role?: UserRole; message?: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        // Query active Supabase Auth session on mount / page refresh
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('[AuthContext] Error fetching Supabase session:', error.message);
        }

        if (session?.user) {
          // Fetch exact user details from Supabase Auth
          const { data: userData } = await supabase.auth.getUser();
          const activeEmail = userData?.user?.email || session.user.email;

          if (isAuthorizedAdminEmail(activeEmail)) {
            if (isMounted) {
              setUser({
                username: activeEmail || 'Admin',
                role: 'admin',
                email: activeEmail,
                id: session.user.id,
              });
            }
            return;
          } else if (isAuthorizedViewerEmail(activeEmail)) {
            if (isMounted) {
              setUser({
                username: 'Shuxbm',
                role: 'birthday',
                email: activeEmail,
                id: session.user.id,
              });
            }
            return;
          } else {
            console.warn(`[AuthContext] Session email (${activeEmail}) is neither authorized Admin nor Viewer. Signing out.`);
            await supabase.auth.signOut();
            try {
              localStorage.removeItem(AUTH_STORAGE_KEYS.IS_AUTHENTICATED);
              localStorage.removeItem(AUTH_STORAGE_KEYS.USERNAME);
              localStorage.removeItem(AUTH_STORAGE_KEYS.ROLE);
              localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
            } catch (err) {
              console.error(err);
            }
          }
        }
      } catch (error) {
        console.error('[AuthContext] Failed to restore session:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    // Listen to Supabase Auth state changes across window/tab lifecycle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        const activeEmail = session.user.email;
        if (isAuthorizedAdminEmail(activeEmail)) {
          setUser({
            username: activeEmail || 'Admin',
            role: 'admin',
            email: activeEmail,
            id: session.user.id,
          });
        } else if (isAuthorizedViewerEmail(activeEmail)) {
          setUser({
            username: 'Shuxbm',
            role: 'birthday',
            email: activeEmail,
            id: session.user.id,
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    identifierInput: string,
    passwordInput: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; role?: UserRole; message?: string }> => {
    const trimmedInput = identifierInput.trim();

    if (!trimmedInput || !passwordInput) {
      return {
        success: false,
        message: 'Invalid username or password.',
      };
    }

    // Resolve input username (e.g. 'Shuxbm') to configured Supabase Auth email address
    const targetEmail = getResolvedEmailForInput(trimmedInput);

    try {
      // Authenticate exclusively via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: passwordInput,
      });

      if (error) {
        let msg = 'Invalid username or password.';
        if (error.message && error.message.toLowerCase().includes('failed to fetch')) {
          msg = 'Unable to connect to Supabase authentication server. Please check your network connection or Supabase configuration in .env.';
        }
        return {
          success: false,
          message: msg,
        };
      }

      if (data?.session && data?.user) {
        // Fetch explicit user profile details via supabase.auth.getUser()
        const { data: userData } = await supabase.auth.getUser();
        const authenticatedEmail = userData?.user?.email || data.user.email;

        // Check if authenticated user is the Admin
        if (isAuthorizedAdminEmail(authenticatedEmail)) {
          const adminUser: User = {
            username: authenticatedEmail || 'Admin',
            role: 'admin',
            email: authenticatedEmail,
            id: data.user.id,
          };

          setUser(adminUser);

          try {
            localStorage.setItem(AUTH_STORAGE_KEYS.IS_AUTHENTICATED, 'true');
            localStorage.setItem(AUTH_STORAGE_KEYS.USERNAME, authenticatedEmail || 'Admin');
            localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, 'admin');
            if (rememberMe) {
              localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true');
            } else {
              localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
            }
          } catch (err) {
            console.error('[AuthContext] Failed to save admin session:', err);
          }

          return {
            success: true,
            role: 'admin',
          };
        }

        // Check if authenticated user is the Viewer (Shubham)
        if (isAuthorizedViewerEmail(authenticatedEmail)) {
          const viewerUser: User = {
            username: 'Shuxbm',
            role: 'birthday',
            email: authenticatedEmail,
            id: data.user.id,
          };

          setUser(viewerUser);

          try {
            localStorage.setItem(AUTH_STORAGE_KEYS.IS_AUTHENTICATED, 'true');
            localStorage.setItem(AUTH_STORAGE_KEYS.USERNAME, 'Shuxbm');
            localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, 'birthday');
            if (rememberMe) {
              localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true');
            } else {
              localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
            }
          } catch (err) {
            console.error('[AuthContext] Failed to save viewer session:', err);
          }

          return {
            success: true,
            role: 'birthday',
          };
        }

        // User authenticated in Supabase but not configured as Admin or Viewer
        console.warn(`[AuthContext] Authenticated email ${authenticatedEmail} is not authorized for Admin or Viewer roles.`);
        await supabase.auth.signOut();

        return {
          success: false,
          message: 'Invalid username or password.',
        };
      }

      return {
        success: false,
        message: 'Invalid username or password.',
      };
    } catch (err: unknown) {
      console.error('[AuthContext] Supabase login error:', err);
      let errorMessage = 'Invalid username or password.';
      if (err instanceof Error && err.message.toLowerCase().includes('failed to fetch')) {
        errorMessage = 'Unable to connect to Supabase authentication server. Please check your network connection or Supabase configuration in .env.';
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = async () => {
    // Stop background music and intro audio on logout
    stopBgMusic();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('stop-all-music'));
      window.dispatchEvent(new Event('pause-bg-music'));
    }

    // Terminate Supabase Auth session
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[AuthContext] Supabase signOut error:', error);
    }

    setUser(null);

    try {
      localStorage.removeItem(AUTH_STORAGE_KEYS.IS_AUTHENTICATED);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USERNAME);
      localStorage.removeItem(AUTH_STORAGE_KEYS.ROLE);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
    } catch (error) {
      console.error('[AuthContext] Failed to clear localStorage auth keys:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
