import React, { useState, useEffect, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Connections from './pages/Connections';
import Chatbot from './pages/Chatbot';
import Settings from './pages/Settings';
import Campaigns from './pages/Campaigns';
import Integrations from './pages/Integrations';
import Kanban from './pages/Kanban';
import Calendar from './pages/Calendar';
import Contacts from './pages/Contacts';
import Dunning from './pages/Dunning';
import Incidents from './pages/Incidents';
import Softphone from './pages/Softphone'; 
import Services from './pages/Services'; 
import Queues from './pages/Queues'; 
import Users from './pages/Users'; 
import SuperAdmin from './pages/SuperAdmin'; 
import Plans from './pages/Plans'; // Import Plans
import Subscription from './pages/Subscription'; 
import Login from './pages/Login';
import Signup from './pages/Signup';
import { Menu, Loader2 } from 'lucide-react';
import { SipProvider } from './context/SipContext'; 
import { AuthProvider, AuthContext } from './context/AuthContext';
import Webphone from './components/Webphone'; 

// Import Socket Client
import { io } from "socket.io-client";

// URL do Backend (ajuste conforme ambiente)
const socketUrl = "http://localhost:8080";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuth, loading, user } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
        );
    }

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    // Role Based Redirection (Optional check)
    // if (user?.super && window.location.hash !== '#/super') {
    //    return <Navigate to="/super" replace />;
    // }

    return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuth, loading, user } = useContext(AuthContext);

    if (loading) return null;

    if (isAuth) {
        if (user?.super) return <Navigate to="/super" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

  // Enforce Dark Mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-slate-950', 'text-white');
  }, []);

  // Sidebar resize listener
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Socket Logic
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    const socket = io(socketUrl);
    socket.on("connect", () => console.log("🔌 Socket Connected"));
    socket.on("appMessage", (data: any) => {
      if (data.action === "create" && !data.message.fromMe) {
        handleNewMessageNotification(data);
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  const handleNewMessageNotification = (data: any) => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.play().catch(e => console.log("Audio play failed"));
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Nova mensagem de ${data.contact.name}`, {
        body: data.message.body,
        icon: data.contact.profilePicUrl || "/favicon.ico",
        tag: "new-message"
      });
    }
  };

  return (
    <SipProvider>
      <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 relative">
        <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
        {!sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 left-6 z-50 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-900/50 transition-transform active:scale-95 animate-in fade-in zoom-in"
          >
            <Menu size={24} />
          </button>
        )}
        <main className="flex-1 overflow-auto relative bg-slate-950 custom-scrollbar w-full">
          {children}
        </main>
        <Webphone />
      </div>
    </SipProvider>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          
          <Route path="/*" element={
            <PrivateRoute>
              <Layout>
                <Routes>
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
                  <Route path="/plans" element={<Plans />} /> {/* New Route */}
                  <Route path="/subscription" element={<Subscription />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;