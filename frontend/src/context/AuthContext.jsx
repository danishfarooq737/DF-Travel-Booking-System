import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchMe,
  loginUser,
  googleLoginUser,
  logoutUser,
  registerUser,
  updateProfile as apiUpdateProfile,
} from '../api/auth';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'tbs_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [loading, setLoading] = useState(true);

  // ============================================================
  // CLEAR SESSION
  // ============================================================
  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);

    setToken(null);
    setUser(null);
  }, []);

  // ============================================================
  // BOOTSTRAP AUTHENTICATION
  // ============================================================
  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetchMe();

        if (isMounted) {
          setUser(res.data.user);
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // HANDLE GLOBAL 401 UNAUTHORIZED EVENTS
  // ============================================================
  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
    };

    window.addEventListener(
      'tbs:unauthorized',
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        'tbs:unauthorized',
        handleUnauthorized
      );
    };
  }, [clearSession]);

  // ============================================================
  // EMAIL/PASSWORD LOGIN
  // ============================================================
  const login = useCallback(async (credentials) => {
    const res = await loginUser(credentials);

    localStorage.setItem(
      TOKEN_KEY,
      res.data.token
    );

    setToken(res.data.token);
    setUser(res.data.user);

    return res.data.user;
  }, []);

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================
  const googleLogin = useCallback(async (credential) => {
    const res = await googleLoginUser(credential);

    localStorage.setItem(
      TOKEN_KEY,
      res.data.token
    );

    setToken(res.data.token);
    setUser(res.data.user);

    return res.data.user;
  }, []);

  // ============================================================
  // REGISTER
  // ============================================================
  const register = useCallback(async (payload) => {
    const res = await registerUser(payload);

    localStorage.setItem(
      TOKEN_KEY,
      res.data.token
    );

    setToken(res.data.token);
    setUser(res.data.user);

    return res.data.user;
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Stateless JWT authentication.
      // Clear the local session even if the API request fails.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // ============================================================
  // UPDATE PROFILE
  // ============================================================
  const refreshProfile = useCallback(async (payload) => {
    const res = await apiUpdateProfile(payload);

    setUser(res.data.user);

    return res.data.user;
  }, []);

  // ============================================================
  // CONTEXT VALUE
  // ============================================================
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',

      login,
      googleLogin,
      register,
      logout,
      refreshProfile,
    }),
    [
      user,
      token,
      loading,
      login,
      googleLogin,
      register,
      logout,
      refreshProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}