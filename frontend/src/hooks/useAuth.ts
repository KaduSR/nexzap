// cspell: disable
import { useContext } from "react";
// Correção do caminho: Adicionado "/Auth"
import { AuthContext } from "../context/Auth/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    // Correção de typo: "br" -> "be"
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
