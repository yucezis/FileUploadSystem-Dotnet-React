import axios from 'axios';

// Backend adresimiz (Portun 7149 olduğuna emin ol, değiştiyse burayı güncelle)
const api = axios.create({
    baseURL: 'https://localhost:7149/api', 
});

// Araya Girici (Interceptor): Her istek gitmeden hemen önce çalışır
api.interceptors.request.use(
    (config) => {
        // Tarayıcı hafızasından giriş yapan kullanıcıyı al
        const savedUser = localStorage.getItem('nimbus_user');
        
        if (savedUser) {
            const user = JSON.parse(savedUser);
            // Eğer kullanıcının token'ı varsa, bunu "Bearer <token>" formatında başlığa ekle
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;