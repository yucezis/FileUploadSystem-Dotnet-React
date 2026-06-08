import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import FileUploader from './components/FileUploader';

const Dashboard = () => {
    const { logout } = useContext(AuthContext);
    return (
        <div className="min-h-screen bg-[#fdf4f8] p-8" style={{ fontFamily: 'var(--font-family)' }}>
            <div className="max-w-4xl mx-auto flex flex-col gap-10">
                <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#1e1028]">NimbusDrive Dashboard</h1>
                    <button 
                        onClick={logout}
                        className="px-6 py-2.5 rounded-xl font-semibold text-[#c45fa0] border border-[#c45fa0]/30 hover:bg-[#c45fa0]/10 transition-colors"
                    >
                        Çıkış Yap
                    </button>
                </div>

                <div className="bg-white/40 backdrop-blur-md p-10 rounded-3xl border border-white/40 shadow-sm">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-[#1e1028]">Dosya Yükle</h2>
                        <p className="text-[#8a6b85] mt-2">Güvenli MinIO deponuza yeni dosyalar ekleyin.</p>
                    </div>
                    
                    <FileUploader />
                </div>
            </div>
        </div>
    );
};

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
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

export default App;