import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { GOOGLE_USER_STORAGE_KEY } from "@utils/constants";
import { getDataFromLocalStorage } from "@utils/local_storage";

const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  locale: string;
}

interface AuthContextValue {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredUser(): GoogleUser | null {
  try {
    const parsed = getDataFromLocalStorage(
      GOOGLE_USER_STORAGE_KEY,
    ) as GoogleUser | null;
    if (
      parsed &&
      typeof parsed.email === "string" &&
      typeof parsed.name === "string"
    ) {
      return {
        email: parsed.email ?? "",
        name: parsed.name ?? "",
        picture: parsed.picture ?? "",
        locale: parsed.locale ?? "en-US",
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        const res = await fetch(USERINFO_URL, {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Userinfo fetch failed");
        }
        const data = (await res.json()) as {
          email?: string;
          name?: string;
          picture?: string;
          locale?: string;
        };
        const profile: GoogleUser = {
          email: data.email ?? "",
          name: data.name ?? "",
          picture: data.picture ?? "",
          locale: data.locale ?? "en-US",
        };
        setUser(profile);
        localStorage.setItem(GOOGLE_USER_STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {
        console.error("Google login / userinfo error", e);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setIsLoading(false);
    },
    scope: "openid email profile",
  });

  const logout = useCallback(() => {
    googleLogout();
    setUser(null);
    localStorage.removeItem(GOOGLE_USER_STORAGE_KEY);
  }, []);

  useEffect(() => {
    const stored = loadStoredUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
