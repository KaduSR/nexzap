import React, { createContext, useState, useEffect } from "react";

const API_URL = "http://localhost:8080";

interface User {
  id: number;
  name: string;
  email: string;
  profile: string;
  companyId: number;
  super?: boolean;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  handleLogin: (userData: any) => Promise<void>;
  handleLogout: () => void;
  handleSignup: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuth(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (userData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Erro ao realizar login");
      }

      const { token, user } = await response.json();

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Inject token globally for other fetch calls (if using axios, here we use fetch)
      // window.api.defaults.headers.Authorization = `Bearer ${token}`; 

      setUser(user);
      setIsAuth(true);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (userData: any) => {
      setLoading(true);
      try {
          const response = await fetch(`${API_URL}/auth/signup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData)
          });

          if (!response.ok) {
              const err = await response.json();
              throw new Error(err.error || "Erro ao criar conta");
          }

          const { token, user } = await response.json();
          
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          
          setUser(user);
          setIsAuth(true);
      } catch (err) {
          throw err;
      } finally {
          setLoading(false);
      }
  }

  const handleLogout = () => {
    setLoading(true);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuth(false);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuth, handleLogin, handleLogout, handleSignup }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };