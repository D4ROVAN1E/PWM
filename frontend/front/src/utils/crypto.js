// Функции для работы с Web Crypto API
const cryptoUtils = {
    // Хэширование мастер-пароля (для сохранения в db.json и проверки)
    async hashPassword(password, salt) {
        const enc = new TextEncoder();
        const data = enc.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    // Генерация ключа шифрования на основе мастер-пароля
    async deriveKey(password, saltStr) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
        );
        return crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: enc.encode(saltStr), iterations: 100000, hash: "SHA-256" },
            keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
        );
    },
    
    // Шифрование данных перед отправкой (возвращает iv и cipher)
    async encryptData(key, dataObj) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();
        const cipher = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv }, key, enc.encode(JSON.stringify(dataObj))
        );
        return {
            iv: Array.from(iv),
            cipher: Array.from(new Uint8Array(cipher))
        };
    },
    
    // Дешифрование полученных данных (из iv и cipher обратно в объект)
    async decryptData(key, encryptedBlob) {
        try {
            const iv = new Uint8Array(encryptedBlob.iv);
            const cipher = new Uint8Array(encryptedBlob.cipher);
            const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, cipher);
            const dec = new TextDecoder();
            return JSON.parse(dec.decode(plain));
        } catch (e) {
            console.error("Ошибка дешифровки. Неверный ключ или поврежденные данные.", e);
            throw new Error("Не удалось расшифровать данные");
        }
    },
    
    // Генерация случайной соли
    generateSalt() {
        return crypto.getRandomValues(new Uint8Array(16)).join('');
    }
};

export default cryptoUtils;