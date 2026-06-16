import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, useState, useEffect } from 'react'; 
import api from './services/api'; 
import Login from './pages/Login';
import Register from './pages/Register';
import FileUploader from './components/FileUploader'; 
import FileList from './components/FileList';

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const Dashboard = () => {
    const { logout } = useContext(AuthContext);
    const [files, setFiles] = useState([]);

    const fetchFiles = async () => {
        try {
            const response = await api.get("/document"); 
            
            const formattedFiles = response.data.map(doc => ({
                id: doc.id,
                name: doc.version > 1 ? `${doc.name} (v${doc.version})` : doc.name,
                size: doc.size ? (doc.size / (1024 * 1024)).toFixed(2) + " MB" : "-", 
                uploadDate: new Date(doc.createdDate).toLocaleDateString("tr-TR", { 
                    day: '2-digit', month: 'short', year: 'numeric' 
                })
            }));
            
            setFiles(formattedFiles);
        } catch (error) {
            console.error("Dosyalar çekilirken hata oluştu:", error);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []); 

    const handleUploadSuccess = () => {
        fetchFiles();
    };

    const handleDelete = async (id) => {
        setFiles(prevFiles => prevFiles.filter(f => f.id !== id));
    };

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await api.get(`/document/download/${fileId}`, {
                responseType: 'blob' 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); 
            document.body.appendChild(link);
            link.click();

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("Dosya indirilirken hata oluştu:", error);
            alert("Dosya indirilemedi. Lütfen tekrar deneyin.");
        }
    };

    const handleShare = async (id) => {
        try {
            const response = await api.post(`/document/${id}/share`);
            
            const shareLink = `https://localhost:7149/api/document/shared/${response.data.token}`;
            
            await navigator.clipboard.writeText(shareLink);
            
            alert("✨ Paylaşım bağlantısı panoya kopyalandı!\nBu linki gönderdiğin herkes dosyayı indirebilir.");
            
        } catch (error) {
            console.error("Paylaşım linki oluşturulurken hata:", error);
            alert("Paylaşım linki oluşturulamadı. Lütfen tekrar deneyin.");
        }
    };
    
    return (
        <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: 'var(--font-family)', background: "linear-gradient(135deg, #fce8f3 0%, #f0e6fb 30%, #e3eeff 65%, #d6f0ff 100%)" }}>
            
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto p-6 md:p-8 relative z-10 flex flex-col gap-8">
                
                <div className="flex justify-between items-center bg-white/60 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/40 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c45fa0, #7ba7e8)" }}>
                            <span className="text-white font-bold text-xl">N</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#1e1028]">NimbusDrive</h1>
                    </div>
                    <button 
                        onClick={logout}
                        className="px-6 py-2.5 rounded-xl font-semibold transition-all hover:bg-white/80"
                        style={{ color: "#c45fa0", border: "1px solid rgba(196,95,160,0.3)", background: "rgba(255,255,255,0.5)" }}
                    >
                        Çıkış Yap
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <FileUploader onUploadSuccess={handleUploadSuccess} />
                    </div>

                    <div className="lg:col-span-2">
                        <FileList files={files} onDelete={handleDelete} onDownload={handleDownload} onShare={handleShare} />
                    </div>
                </div>
                
            </div>
        </div>
    );
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