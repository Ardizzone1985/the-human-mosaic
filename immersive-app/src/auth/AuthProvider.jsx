import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Load profile error:", error);
      setProfile(null);
      return;
    }

    setProfile(data);
  }

  async function refreshAuth() {
    setLoadingAuth(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user ?? null);

    if (user) {
      await loadProfile(user.id);
    } else {
      setProfile(null);
    }

    setLoadingAuth(false);
  }

  async function logout() {
  setLoadingAuth(true);

  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (error) {
    console.error("Logout error:", error);
  }

  setUser(null);
  setProfile(null);
  setLoadingAuth(false);
}

  useEffect(() => {
    refreshAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        await loadProfile(nextUser.id);
      } else {
        setProfile(null);
      }

      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loadingAuth,
        refreshAuth,
        loadProfile,
        logout,
        isLoggedIn: !!user,
        isGuest: !user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
