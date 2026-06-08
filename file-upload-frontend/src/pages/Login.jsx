import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";
import { Eye, EyeOff, Cloud, HardDrive, Lock, Mail } from "lucide-react";

function FloatingBlob({ className }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-40 pointer-events-none ${className}`} />
  );
}

function FileCard({ icon, name, size, color }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-sm border border-white/40 bg-white/30 shadow-sm">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate text-white/90 font-medium">{name}</p>
        <p className="text-xs text-white/60">{size}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${color}`} />
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await api.post("/auth/login", { email, password });
      login(response.data.accessToken); 
      
    } catch (error) {
      setErrorMsg("Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden relative" style={{ fontFamily: "var(--font-family)" }}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #fce8f3 0%, #f0e6fb 30%, #e3eeff 65%, #d6f0ff 100%)",
        }}
      />

      <FloatingBlob className="w-96 h-96 top-[-80px] left-[-60px] bg-pink-300" />
      <FloatingBlob className="w-80 h-80 bottom-[-60px] right-[40%] bg-blue-300" />
      <FloatingBlob className="w-64 h-64 top-[30%] right-[-40px] bg-purple-200" />
      <FloatingBlob className="w-56 h-56 bottom-[-30px] left-[30%] bg-pink-200" />

      <div className="hidden lg:flex flex-col justify-between flex-1 relative z-10 p-12">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #c45fa0, #7ba7e8)" }}
          >
            <HardDrive size={20} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "#1e1028" }}>
            NimbusDrive
          </span>
        </div>

        <div className="flex flex-col gap-8 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 style={{ fontSize: "2.75rem", fontWeight: 700, lineHeight: 1.2, color: "#1e1028" }}>
              Dosyalarınız,<br />
              <span style={{ background: "linear-gradient(90deg, #c45fa0, #7ba7e8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                her zaman yanınızda.
              </span>
            </h1>
            <p className="mt-4" style={{ color: "#5a4060", fontSize: "1.05rem", lineHeight: 1.7 }}>
              Kişisel MinIO depolama alanınıza güvenli erişim. Tüm dosyalarınız şifreli ve güvende.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-3 max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <div
              className="rounded-3xl p-4 flex flex-col gap-2 shadow-xl"
              style={{ background: "linear-gradient(135deg, rgba(196,95,160,0.75), rgba(123,167,232,0.75))", backdropFilter: "blur(12px)" }}
            >
              <p className="text-xs text-white/70 mb-1" style={{ fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Son Yüklenenler</p>
              <FileCard icon="🖼️" name="tatil-fotograflari.zip" size="248 MB" color="bg-pink-300" />
              <FileCard icon="📄" name="proje-raporu-2024.pdf" size="3.2 MB" color="bg-blue-300" />
              <FileCard icon="🎵" name="calisma-listesi.m4a" size="67 MB" color="bg-purple-300" />
            </div>
          </motion.div>
        </div>

        <motion.div
          className="flex gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {[
            { label: "Toplam Depolama", value: "500 GB" },
            { label: "Dosya Sayısı", value: "1,284" },
            { label: "Son Giriş", value: "Bugün" },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontWeight: 700, fontSize: "1.3rem", color: "#1e1028" }}>{s.value}</p>
              <p style={{ fontSize: "0.8rem", color: "#8a6b85" }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex items-center justify-center w-full lg:w-[480px] lg:flex-none relative z-10 p-6">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className="rounded-3xl p-8 flex flex-col gap-6 border"
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(24px)",
              borderColor: "rgba(196,95,160,0.15)",
              boxShadow: "0 20px 60px rgba(196,95,160,0.18), 0 4px 20px rgba(123,167,232,0.14)",
            }}
          >
            <div>
              <h2 style={{ fontWeight: 700, fontSize: "1.6rem", color: "#1e1028", lineHeight: 1.3 }}>
                Tekrar hoş geldiniz 👋
              </h2>
              <p style={{ color: "#8a6b85", marginTop: "0.4rem", fontSize: "0.9rem" }}>
                Devam etmek için giriş yapın.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#5a4060" }}>
                  E-posta
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-pink-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.72)", borderColor: "rgba(196,95,160,0.2)" }}
                    onFocus={(e) => (e.target.style.borderColor = "#c45fa0")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(196,95,160,0.2)")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#5a4060" }}>Şifre</label>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl border outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.72)", borderColor: "rgba(123,167,232,0.2)" }}
                    onFocus={(e) => (e.target.style.borderColor = "#7ba7e8")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(123,167,232,0.2)")}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3.5 rounded-xl flex items-center justify-center gap-2 overflow-hidden transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #c45fa0 0%, #9b7ad4 50%, #7ba7e8 100%)",
                  color: "white",
                  fontWeight: 600,
                  opacity: isLoading ? 0.8 : 1,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    <Cloud size={17} />
                    Giriş Yap
                  </>
                )}
              </motion.button>
            </form>

            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#b0a0b8" }}>
              Hesabınız yok mu? <Link to="/register" style={{ color: "#c45fa0", fontWeight: 600 }}>Kayıt Ol</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}