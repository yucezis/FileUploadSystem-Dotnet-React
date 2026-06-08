import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import FileUploader from './components/FileUploader'; 
import FileList from './components/FileList'; 

// Giriş yapmamış kullanıcıları zorla Login'e atan korumalı rota bileşeni
const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Yenilenmiş Harika Dashboard Bileşenimiz
const Dashboard = () => {
    const { logout } = useContext(AuthContext);
    
    return (
        <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: 'var(--font-family)', background: "linear-gradient(135deg, #fce8f3 0%, #f0e6fb 30%, #e3eeff 65%, #d6f0ff 100%)" }}>
            
            {/* Arka plan dekoratif baloncukları */}
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto p-6 md:p-8 relative z-10 flex flex-col gap-8">
                
                {/* Header (Üst Menü) */}
                <div className="flex justify-between items-center bg-white/60 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/40 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c45fa0, #7ba7e8)" }}>
                            <span className="text-white font-bold text-xl">N</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#1e1028]">NimbusDrive</h1>
                    </div>
                    <button 
                        onClick={logout}
                        className="px-6 py-2.5 rounded-xl font-semibold transition-all"
                        style={{ color: "#c45fa0", border: "1px solid rgba(196,95,160,0.3)", background: "rgba(255,255,255,0.5)" }}
                    >
                        Çıkış Yap
                    </button>
                </div>

                {/* Ana İçerik Izgarası */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sol Taraf: Dosya Yükleme Alanı */}
                    <div className="lg:col-span-1">
                        <FileUploader />
                    </div>

                    {/* Sağ Taraf: Dosya Listesi ve Arama */}
                    <div className="lg:col-span-2">
                        <FileList />
                    </div>
                </div>
                
            </div>
        </div>
    );
};

// ANA UYGULAMA BİLEŞENİ (Eksik olan kısım burasıydı)
function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Dashboard sadece giriş yapanlara açık! */}
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </AuthProvider>
    );
}

// React'in aradığı sihirli kelime (export default)
export default App;