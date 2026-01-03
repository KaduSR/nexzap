// cspell: disable
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

interface User {
  id: number;
  name: string;
  email: string;
  companyId: number;
  profile: string;
  super: boolean;
}

interface LoginParams {
  email: string;
  password: string;
}

interface SignupParams {
  name: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
  planId?: number;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  handleLogin: (params: LoginParams) => Promise<void>;
  handleLogout: () => void;
  handleSignup: (params: SignupParams) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setIsAuth(true);
        } catch (err) {
          handleLogout();
        }
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  const handleLogin = async ({ email, password }: LoginParams) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      const { token, user } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("CompanyId", user.companyId);
      localStorage.setItem("userId", user.id);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      setIsAuth(true);

      toast.success(`Bem-vindo, ${user.name}!`);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Erro ao realizar login";
      toast.error(errorMsg);
    }
  };

  const handleSignup = async (params: SignupParams) => {
    try {
      await api.post("/auth/signup", params);
      toast.success("Conta criada com sucesso!");
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Erro ao criar conta";
      toast.error(errorMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("companyId");
    localStorage.removeItem("userId");

    api.defaults.headers.common["Authorization"] = undefined;
    setIsAuth(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuth,
        handleLogin,
        handleLogout,
        handleSignup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
