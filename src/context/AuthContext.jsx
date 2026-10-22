import { createContext, useContext, useMemo, useState } from "react";
import { clearDemoUser, getDemoUser, signInDemo } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getDemoUser);
  const [loading] = useState(false);

  async function signIn(credentials) {
    const nextUser = await signInDemo(credentials);
    setUser(nextUser);
    return nextUser;
  }

  function signOut() {
    clearDemoUser();
    setUser(null);
  }

  const value = useMemo(() => ({ user, setUser, loading, signIn, signOut }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}
