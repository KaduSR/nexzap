// cspell:disable
import React, { useContext } from "react";
import {
  Navigate,
  Outlet,
  Route,
  HashRouter as Router,
  Routes,
} from "react-router-dom";

import { Loader2, Menu } from "lucide-react";

// Contextos
import { AuthContext, AuthProvider } from "./context/Auth/AuthContext";
import { SipProvider } from "./context/SipContext";
import { SocketProvider } from "./context/SocketContext"; // <-- NOVO

// Layout & Componentes
import Sidebar from "./components/Sidebar";
import Webphone from "./components/Webphone";

// Páginas
import Calendar from "./pages/Calendar";
import Campaigns from "./pages/Campaigns";
import Chatbot from "./pages/Chatbot";
import Connections from "./pages/Connections";
import Contacts from "./pages/Contacts";
import Dashboard from "./pages/Dashboard";
import Dunning from "./pages/Dunning";
import Incidents from "./pages/Incidents";
import Integrations from "./pages/Integrations";
import Kanban from "./pages/Kanban";
import Login from "./pages/Login";
import Plans from "./pages/Plans";
import Queues from "./pages/Queues";
import Services from "./pages/Services";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Softphone from "./pages/Softphone";
import Subscription from "./pages/Subscription";
import SuperAdmin from "./pages/SuperAdmin";
import Tickets from "./pages/Tickets";
import Users from "./pages/Users";

// ----------------------------------------------------------
// ROTAS PRIVADAS
// ----------------------------------------------------------
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuth, loading, user } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

// ----------------------------------------------------------
// ROTAS PÚBLICAS
// ----------------------------------------------------------
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuth, loading, user } = useContext(AuthContext);

  if (loading) return null;
  if (isAuth) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

// ----------------------------------------------------------
// LAYOUT PRINCIPAL
// ----------------------------------------------------------
const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(
    window.matchMedia("(min-width: 1024px)").matches
  );

  // Forçar dark mode sempre
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.classList.add("bg-slate-950", "text-white");
  }, []);

  // Responsividade da sidebar
  React.useEffect(() => {
    const handler = () =>
      setSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <SipProvider>
      <div className="flex h-screen bg-slate-950 text-slate-100 relative">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Botão mobile */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 left-6 z-50 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl"
          >
            <Menu size={24} />
          </button>
        )}

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden bg-slate-950 custom-scrollbar">
          <Outlet />
        </main>

        <Webphone />
      </div>
    </SipProvider>
  );
};

// ----------------------------------------------------------
// APLICATIVO PRINCIPAL
// ----------------------------------------------------------
const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* PÚBLICAS */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* PRIVADAS + LAYOUT */}
            <Route
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/dunning" element={<Dunning />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/softphone" element={<Softphone />} />
              <Route path="/services" element={<Services />} />
              <Route path="/queues" element={<Queues />} />
              <Route path="/users" element={<Users />} />
              <Route path="/super" element={<SuperAdmin />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/subscription" element={<Subscription />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
