export type UserRole = 'admin' | 'birthday';

export interface User {
  username: string;
  role: UserRole;
  email?: string;
  id?: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface UserCredential extends AuthCredentials {
  role: UserRole;
}

// Retained for role and type compatibility (all logins now use Supabase Auth)
export const PREDEFINED_USERS: UserCredential[] = [];

export const AUTH_STORAGE_KEYS = {
  IS_AUTHENTICATED: 'isAuthenticated',
  USERNAME: 'username',
  ROLE: 'role',
  REMEMBER_ME: 'rememberMe',
} as const;
