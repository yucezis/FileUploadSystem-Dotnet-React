import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, HardDrive, Lock, Mail, User, CheckCircle2, Circle } from "lucide-react";

function FloatingBlob({ className }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-40 pointer-events-none ${className}`} />
  );
}

function PasswordRule({ met, text }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 size={13} style={{ color: "#c45fa0", flexShrink: 0 }} />
      ) : (
        <Circle size={13} style={{ color: "#d0bece", flexShrink: 0 }} />
      )}
      <span style={{ fontSize: "0.75rem", color: met ? "#c45fa0" : "#b0a0b8", transition: "color 0.2s" }}>{text}</span>
    </div>
  );
}

function StrengthBar({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const colors = ["#f0e6fb", "#f9a8d4", "#c45fa0", "#7ba7e8"];
  const labels = ["", "Zayıf", "Orta", "Güçlü", "Çok Güçlü"];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score - 1] : "#f0e6fb" }}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p style={{ fontSize: "0.72rem", color: colors[score - 1] ?? "#b0a0b8" }}>
          {labels[score]}
        </p>
      )}
    </div>
  );
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const passwordRules = [
    { met: password.length >= 8, text: "En az 8 karakter" },
    { met: /[A-Z]/.test(password), text: "Bir büyük harf" },
    { met: /[0-9]/.test(password), text: "Bir rakam" },
    { met: /[^A-Za-z0-9]/.test(password), text: "Bir özel karakter" },
  ];

  const passwordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed || passwordMismatch) return;
    
    setIsLoading(true);
    setErrorMsg("");

    try {
      await api.post('/auth/register', { email, password });
      setSuccess(true);
    } catch (error) {
      setErrorMsg("Kayıt başarısız oldu. E-posta adresi zaten kullanımda olabilir.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden relative" style={{ fontFamily: "var(--font-family)" }}>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #fce8f3 0%, #f0e6fb 30%, #e3eeff 65%, #d6f0ff 100%)" }}
      />

      <FloatingBlob className="w-96 h-96 top-[-80px] right-[-60px] bg-blue-300" />
      <FloatingBlob className="w-80 h-80 bottom-[-60px] left-[40%] bg-pink-300" />
      <FloatingBlob className="w-64 h-64 top-[30%] left-[-40px] bg-purple-200" />
      <FloatingBlob className="w-56 h-56 bottom-[-30px] right-[30%] bg-blue-200" />

      <div className="hidden lg:flex flex-col justify-between flex-1 relative z-10 p-12">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #c45fa0, #7ba7e8)" }}
          >
            <HardDrive size={20} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "#1e1028" }}>NimbusDrive</span>
        </div>

        <div className="flex flex-col gap-8 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 style={{ fontSize: "2.75rem", fontWeight: 700, lineHeight: 1.2, color: "#1e1028" }}>
              Kendi bulutunuzu<br />
              <span style={{ background: "linear-gradient(90deg, #7ba7e8, #c45fa0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                şimdi kurun.
              </span>
            </h1>
            <p className="mt-4" style={{ color: "#5a4060", fontSize: "1.05rem", lineHeight: 1.7 }}>
              MinIO altyapısı üzerinde tamamen size özel bir depolama alanı oluşturun. Verileriniz her zaman sizin kontrolünüzde.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            {[
              { icon: "🔒", title: "Uçtan Uca Şifreleme", desc: "Dosyalarınız AES-256 ile korunur" },
              { icon: "⚡", title: "Yüksek Hız", desc: "MinIO ile milisaniye gecikme" },
              { icon: "🌐", title: "Her Yerden Erişim", desc: "Cihaz fark etmeksizin bağlanın" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl border"
                style={{
                  background: "rgba(255,255,255,0.45)",
                  backdropFilter: "blur(12px)",
                  borderColor: "rgba(255,255,255,0.6)",
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e1028" }}>{item.title}</p>
                  <p style={{ fontSize: "0.8rem", color: "#8a6b85" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{ fontSize: "0.8rem", color: "#8a6b85" }}
        >
          Zaten hesabınız var mı?{" "}
          <button
            onClick={() => navigate("/login")}
            style={{ color: "#c45fa0", fontWeight: 600 }}
          >
            Giriş yapın →
          </button>
        </motion.p>
      </div>

      <div className="flex items-center justify-center w-full lg:w-[500px] lg:flex-none relative z-10 p-6">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl p-10 flex flex-col items-center gap-5 text-center border"
                style={{
                  background: "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(24px)",
                  borderColor: "rgba(196,95,160,0.15)",
                  boxShadow: "0 20px 60px rgba(196,95,160,0.18)",
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #c45fa0, #7ba7e8)" }}
                >
                  <CheckCircle2 size={32} color="white" />
                </motion.div>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: "1.5rem", color: "#1e1028" }}>Hesabınız Oluşturuldu!</h2>
                  <p className="mt-2" style={{ color: "#8a6b85", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    Hoş geldiniz, <strong style={{ color: "#c45fa0" }}>{name || email.split('@')[0]}</strong>!<br />
                    Drive'ınız kullanıma hazır.
                  </p>
                </div>
                <motion.button
                  onClick={() => navigate("/login")}
                  className="w-full py-3.5 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #c45fa0 0%, #9b7ad4 50%, #7ba7e8 100%)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 20px rgba(196,95,160,0.4)",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Giriş Sayfasına Git
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="form">
                <div
                  className="rounded-3xl p-8 flex flex-col gap-5 border"
                  style={{
                    background: "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(24px)",
                    borderColor: "rgba(196,95,160,0.15)",
                    boxShadow: "0 20px 60px rgba(196,95,160,0.18), 0 4px 20px rgba(123,167,232,0.14)",
                  }}
                >
                  <div className="flex lg:hidden items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shadow"
                      style={{ background: "linear-gradient(135deg, #c45fa0, #7ba7e8)" }}
                    >
                      <HardDrive size={18} color="white" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1e1028" }}>NimbusDrive</span>
                  </div>

                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: "1.6rem", color: "#1e1028", lineHeight: 1.3 }}>
                      Hesap oluşturun ✨
                    </h2>
                    <p style={{ color: "#8a6b85", marginTop: "0.4rem", fontSize: "0.9rem" }}>
                      Kişisel drive'ınıza ilk adımı atın.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#5a4060" }}>Ad Soyad</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#c45fa0" }} />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Adınız Soyadınız"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all"
                          style={{ background: "rgba(255,255,255,0.72)", borderColor: "rgba(196,95,160,0.2)", color: "#1e1028", fontSize: "0.9rem" }}
                          onFocus={(e) => (e.target.style.borderColor = "#c45fa0")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(196,95,160,0.2)")}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#5a4060" }}>E-posta</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9b7ad4" }} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ornek@mail.com"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all"
                          style={{ background: "rgba(255,255,255,0.72)", borderColor: "rgba(155,122,212,0.2)", color: "#1e1028", fontSize: "0.9rem" }}
                          onFocus={(e) => (e.target.style.borderColor = "#9b7ad4")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(155,122,212,0.2)")}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#5a4060" }}>Şifre</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#7ba7e8" }} />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-11 py-3 rounded-xl border outline-none transition-all"
                          style={{ background: "rgba(255,255,255,0.72)", borderColor: "rgba(123,167,232,0.2)", color: "#1e1028", fontSize: "0.9rem" }}
                          onFocus={(e) => (e.target.style.borderColor = "#7ba7e8")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(123,167,232,0.2)")}
                        />
                        <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#b0a0b8" }} onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {password.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="flex flex-col gap-1.5 mt-1"
                        >
                          <StrengthBar password={password} />
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
                            {passwordRules.map((r) => (
                              <PasswordRule key={r.text} met={r.met} text={r.text} />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#5a4060" }}>Şifreyi Onayla</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: passwordMatch ? "#c45fa0" : passwordMismatch ? "#d4183d" : "#7ba7e8" }} />
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-11 py-3 rounded-xl border outline-none transition-all"
                          style={{
                            background: "rgba(255,255,255,0.72)",
                            borderColor: passwordMatch ? "#c45fa0" : passwordMismatch ? "#d4183d" : "rgba(123,167,232,0.2)",
                            color: "#1e1028",
                            fontSize: "0.9rem",
                          }}
                          onFocus={(e) => { if (!passwordMatch && !passwordMismatch) e.target.style.borderColor = "#7ba7e8"; }}
                          onBlur={(e) => { if (!passwordMatch && !passwordMismatch) e.target.style.borderColor = "rgba(123,167,232,0.2)"; }}
                        />
                        <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#b0a0b8" }} onClick={() => setShowConfirm(!showConfirm)}>
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {passwordMismatch && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ fontSize: "0.75rem", color: "#d4183d" }}>
                            Şifreler eşleşmiyor
                          </motion.p>
                        )}
                        {passwordMatch && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ fontSize: "0.75rem", color: "#c45fa0" }}>
                            ✓ Şifreler eşleşiyor
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <div
                        className="relative w-4 h-4 mt-0.5 rounded flex items-center justify-center border transition-all cursor-pointer flex-shrink-0"
                        style={{
                          background: agreed ? "linear-gradient(135deg, #c45fa0, #7ba7e8)" : "transparent",
                          borderColor: agreed ? "#c45fa0" : "rgba(196,95,160,0.3)",
                        }}
                        onClick={() => setAgreed(!agreed)}
                      >
                        {agreed && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: "0.82rem", color: "#5a4060", lineHeight: 1.5 }}>
                        <button type="button" style={{ color: "#c45fa0", fontWeight: 600 }}>Kullanım Şartları</button> ve{" "}
                        <button type="button" style={{ color: "#7ba7e8", fontWeight: 600 }}>Gizlilik Politikası</button>'nı okudum ve kabul ediyorum.
                      </span>
                    </label>

                    <motion.button
                      type="submit"
                      disabled={isLoading || !agreed || passwordMismatch}
                      className="relative w-full py-3.5 rounded-xl flex items-center justify-center gap-2 overflow-hidden"
                      style={{
                        background: agreed && !passwordMismatch
                          ? "linear-gradient(135deg, #c45fa0 0%, #9b7ad4 50%, #7ba7e8 100%)"
                          : "linear-gradient(135deg, #e0c8da, #c8d8f0)",
                        color: agreed && !passwordMismatch ? "white" : "#b0a0b8",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        boxShadow: agreed && !passwordMismatch ? "0 4px 20px rgba(196,95,160,0.4)" : "none",
                        transition: "all 0.3s",
                      }}
                      whileHover={agreed && !passwordMismatch ? { scale: 1.02 } : {}}
                      whileTap={agreed && !passwordMismatch ? { scale: 0.98 } : {}}
                    >
                      {isLoading ? (
                        <motion.div
                          className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <>
                          <HardDrive size={17} />
                          Hesap Oluştur
                        </>
                      )}
                    </motion.button>
                  </form>

                  <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#8a6b85" }}>
                    Zaten hesabınız var mı?{" "}
                    <button
                      onClick={() => navigate("/login")}
                      style={{ color: "#c45fa0", fontWeight: 600 }}
                    >
                      Giriş yapın
                    </button>
                  </p>
                </div>

                <p className="text-center mt-4" style={{ fontSize: "0.75rem", color: "#8a6b85" }}>
                  🔒 Bağlantınız şifreli ve güvenlidir
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}