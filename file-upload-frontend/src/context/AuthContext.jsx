import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. State'i başlatırken (sayfa yenilendiğinde) önce localStorage'a bakıyoruz
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("nimbus_user");
        // Eğer daha önce kaydedilmiş bir kullanıcı varsa onu JSON'dan çevirip state'e koy, yoksa null yap
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // 2. Giriş (Login) fonksiyonu
    const login = (userData) => {
        setUser(userData); // React state'ine kaydet (Anında arayüzü günceller)
        // Aynı zamanda tarayıcının hafızasına kaydet (Sayfa yenilense de silinmez)
        localStorage.setItem("nimbus_user", JSON.stringify(userData));
        
        // Eğer token kullanıyorsan onu da ayrı olarak kaydedebilirsin (İsteğe bağlı)
        if (userData.token) {
            localStorage.setItem("nimbus_token", userData.token);
        }
    };

    // 3. Çıkış (Logout) fonksiyonu
    const logout = () => {
        setUser(null); // React state'ini temizle
        // Tarayıcıdaki tüm izleri sil
        localStorage.removeItem("nimbus_user");
        localStorage.removeItem("nimbus_token");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};